<?php

declare(strict_types=1);

/**
 * Vérification locale des ID tokens Google Identity Services.
 *
 * Aucun secret OAuth n'est nécessaire pour ce flux : le serveur valide la
 * signature RS256 avec les certificats publics que Google publie et associe
 * uniquement le claim `sub` à un utilisateur local.
 */

function jp_google_client_id(): string
{
    return trim((string)env('GOOGLE_CLIENT_ID', ''));
}

function jp_google_is_configured(): bool
{
    return preg_match('/^[0-9]+-[A-Za-z0-9_-]+\.apps\.googleusercontent\.com$/', jp_google_client_id()) === 1;
}

function jp_google_base64url_decode(string $value): ?string
{
    if ($value === '' || preg_match('/[^A-Za-z0-9_-]/', $value)) {
        return null;
    }

    $padded = strtr($value, '-_', '+/') . str_repeat('=', (4 - strlen($value) % 4) % 4);
    $decoded = base64_decode($padded, true);
    return is_string($decoded) ? $decoded : null;
}

function jp_google_certificates_cache_file(): string
{
    return JP_ROOT . '/storage/cache/google-id-token-certs.json';
}

function jp_google_normalize_certificates(mixed $certificates): array
{
    if (!is_array($certificates)) {
        return [];
    }

    $valid = [];
    foreach ($certificates as $kid => $certificate) {
        if (!is_string($kid) || $kid === '' || !is_string($certificate) || !str_contains($certificate, 'BEGIN CERTIFICATE')) {
            continue;
        }
        $valid[$kid] = $certificate;
    }
    return $valid;
}

function jp_google_read_cached_certificates(): ?array
{
    $cacheFile = jp_google_certificates_cache_file();
    if (!is_file($cacheFile) || !is_readable($cacheFile)) {
        return null;
    }

    try {
        $cached = json_decode((string)file_get_contents($cacheFile), true, 32, JSON_THROW_ON_ERROR);
    } catch (Throwable) {
        return null;
    }

    $certificates = jp_google_normalize_certificates($cached['certificates'] ?? null);
    if ($certificates === [] || (int)($cached['expires_at'] ?? 0) <= time()) {
        return null;
    }
    return $certificates;
}

function jp_google_cache_certificates(array $certificates, int $maxAge): void
{
    $directory = dirname(jp_google_certificates_cache_file());
    if (!is_dir($directory) && !@mkdir($directory, 0750, true) && !is_dir($directory)) {
        return;
    }

    $payload = [
        'expires_at' => time() + max(60, min($maxAge, 86400)),
        'certificates' => $certificates,
    ];

    try {
        $json = json_encode($payload, JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES);
        $target = jp_google_certificates_cache_file();
        $temporary = $target . '.' . bin2hex(random_bytes(4)) . '.tmp';
        if (@file_put_contents($temporary, $json, LOCK_EX) !== false) {
            @rename($temporary, $target);
        }
    } catch (Throwable) {
        // Le cache est une optimisation : l'authentification peut fonctionner sans lui.
    }
}

function jp_google_fetch_certificates(): ?array
{
    $endpoint = 'https://www.googleapis.com/oauth2/v1/certs';
    $body = null;
    $maxAge = 3600;

    if (function_exists('curl_init')) {
        $curl = curl_init($endpoint);
        if ($curl !== false) {
            curl_setopt_array($curl, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HEADER => true,
                CURLOPT_FOLLOWLOCATION => false,
                CURLOPT_CONNECTTIMEOUT => 5,
                CURLOPT_TIMEOUT => 8,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_SSL_VERIFYHOST => 2,
                CURLOPT_HTTPHEADER => ['Accept: application/json'],
            ]);
            $response = curl_exec($curl);
            $status = (int)curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
            $headerSize = (int)curl_getinfo($curl, CURLINFO_HEADER_SIZE);
            curl_close($curl);
            if (is_string($response) && $status === 200) {
                $headers = substr($response, 0, $headerSize);
                $body = substr($response, $headerSize);
                if (preg_match('/^cache-control:\s*[^\r\n]*max-age=(\d+)/im', $headers, $match)) {
                    $maxAge = (int)$match[1];
                }
            }
        }
    }

    if ($body === null && filter_var(ini_get('allow_url_fopen'), FILTER_VALIDATE_BOOLEAN)) {
        $context = stream_context_create([
            'http' => ['method' => 'GET', 'timeout' => 8, 'ignore_errors' => true, 'header' => "Accept: application/json\r\n"],
            'ssl' => ['verify_peer' => true, 'verify_peer_name' => true],
        ]);
        $response = @file_get_contents($endpoint, false, $context);
        $headers = $http_response_header ?? [];
        $statusOk = is_array($headers) && preg_match('/\s200\s/', (string)($headers[0] ?? '')) === 1;
        if (is_string($response) && $statusOk) {
            $body = $response;
            foreach ($headers as $header) {
                if (preg_match('/^cache-control:\s*.*max-age=(\d+)/i', $header, $match)) {
                    $maxAge = (int)$match[1];
                    break;
                }
            }
        }
    }

    if (!is_string($body) || $body === '') {
        return null;
    }

    try {
        $certificates = jp_google_normalize_certificates(json_decode($body, true, 32, JSON_THROW_ON_ERROR));
    } catch (Throwable) {
        return null;
    }
    if ($certificates === []) {
        return null;
    }

    jp_google_cache_certificates($certificates, $maxAge);
    return $certificates;
}

function jp_google_certificates(): ?array
{
    return jp_google_read_cached_certificates() ?? jp_google_fetch_certificates();
}

function jp_google_email_is_verified(mixed $value): bool
{
    return $value === true || $value === 1 || $value === '1' || $value === 'true';
}

function jp_google_email_is_authoritative(array $claims): bool
{
    $email = strtolower((string)($claims['email'] ?? ''));
    $hostedDomain = trim((string)($claims['hd'] ?? ''));
    return str_ends_with($email, '@gmail.com') || (jp_google_email_is_verified($claims['email_verified'] ?? false) && $hostedDomain !== '');
}

/**
 * @return array<string, mixed>|null Claims vérifiés, ou null si le jeton est invalide.
 */
function jp_google_verify_id_token(string $idToken): ?array
{
    if (!jp_google_is_configured() || !function_exists('openssl_verify') || strlen($idToken) > 8192) {
        return null;
    }

    $segments = explode('.', $idToken);
    if (count($segments) !== 3 || in_array('', $segments, true)) {
        return null;
    }

    [$encodedHeader, $encodedPayload, $encodedSignature] = $segments;
    $headerJson = jp_google_base64url_decode($encodedHeader);
    $payloadJson = jp_google_base64url_decode($encodedPayload);
    $signature = jp_google_base64url_decode($encodedSignature);
    if ($headerJson === null || $payloadJson === null || $signature === null) {
        return null;
    }

    try {
        $header = json_decode($headerJson, true, 16, JSON_THROW_ON_ERROR);
        $claims = json_decode($payloadJson, true, 32, JSON_THROW_ON_ERROR);
    } catch (Throwable) {
        return null;
    }
    if (!is_array($header) || !is_array($claims) || ($header['alg'] ?? '') !== 'RS256') {
        return null;
    }

    $kid = (string)($header['kid'] ?? '');
    if ($kid === '' || strlen($kid) > 255) {
        return null;
    }
    $certificates = jp_google_certificates();
    $certificate = is_array($certificates) ? ($certificates[$kid] ?? null) : null;
    // Google fait tourner ses certificats. Si le cache encore valide ne connaît
    // pas le `kid` du jeton, on le rafraîchit une fois avant de refuser le jeton.
    if (!is_string($certificate)) {
        $certificates = jp_google_fetch_certificates();
        $certificate = is_array($certificates) ? ($certificates[$kid] ?? null) : null;
    }
    if (!is_string($certificate) || openssl_verify($encodedHeader . '.' . $encodedPayload, $signature, $certificate, OPENSSL_ALGO_SHA256) !== 1) {
        return null;
    }

    $now = time();
    $issuer = (string)($claims['iss'] ?? '');
    $expiration = filter_var($claims['exp'] ?? null, FILTER_VALIDATE_INT);
    $issuedAt = filter_var($claims['iat'] ?? null, FILTER_VALIDATE_INT);
    $notBefore = array_key_exists('nbf', $claims) ? filter_var($claims['nbf'], FILTER_VALIDATE_INT) : null;
    $audience = $claims['aud'] ?? null;
    $audiences = is_array($audience) ? $audience : [$audience];
    $clientId = jp_google_client_id();

    if (!in_array($issuer, ['accounts.google.com', 'https://accounts.google.com'], true)
        || $expiration === false || $expiration < ($now - 60)
        || $issuedAt === false || $issuedAt > ($now + 60)
        || ($notBefore !== null && ($notBefore === false || $notBefore > ($now + 60)))
        || !in_array($clientId, $audiences, true)) {
        return null;
    }

    $authorizedParty = (string)($claims['azp'] ?? '');
    if ((count($audiences) > 1 || $authorizedParty !== '') && !hash_equals($clientId, $authorizedParty)) {
        return null;
    }

    $subject = (string)($claims['sub'] ?? '');
    $email = strtolower(trim((string)($claims['email'] ?? '')));
    if (preg_match('/^[A-Za-z0-9_-]{6,255}$/', $subject) !== 1
        || mb_strlen($email, 'UTF-8') > 254
        || !filter_var($email, FILTER_VALIDATE_EMAIL)
        || !jp_google_email_is_verified($claims['email_verified'] ?? false)) {
        return null;
    }

    $allowedHostedDomain = strtolower(trim((string)env('GOOGLE_ALLOWED_HOSTED_DOMAIN', '')));
    if ($allowedHostedDomain !== '' && !hash_equals($allowedHostedDomain, strtolower(trim((string)($claims['hd'] ?? ''))))) {
        return null;
    }

    $claims['email'] = $email;
    $claims['sub'] = $subject;
    return $claims;
}
