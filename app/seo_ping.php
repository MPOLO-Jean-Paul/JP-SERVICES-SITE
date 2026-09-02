<?php

declare(strict_types=1);

/**
 * Notification des moteurs de recherche via le protocole IndexNow.
 * Note : le « ping sitemap » Google historique est supprimé (HTTP 404 depuis 2024).
 * Google découvre les nouveautés via le sitemap dynamique (lastmod) déclaré dans robots.txt.
 * IndexNow couvre Bing, Yandex, Naver et Seznam en un seul appel.
 */

function jp_indexnow_status_file(): string
{
    return JP_ROOT . '/storage/cache/indexnow-status.json';
}

function jp_indexnow_last_status(): ?array
{
    $file = jp_indexnow_status_file();
    if (!is_file($file)) {
        return null;
    }
    $data = json_decode((string)@file_get_contents($file), true);
    return is_array($data) ? $data : null;
}

/** @param array<int, string> $paths Chemins relatifs (ex. '/formation?id=12') */
function jp_indexnow_ping(array $paths): array
{
    $key = trim((string)env('INDEXNOW_KEY', ''));
    $host = strtolower((string)(parse_url(trim((string)env('APP_URL', '')), PHP_URL_HOST) ?? ''));
    if ($key === '' || $host === '') {
        return ['ok' => false, 'code' => 0, 'urls' => 0, 'date' => date('c'), 'message' => 'INDEXNOW_KEY ou APP_URL manquant dans le .env — ping ignoré.'];
    }

    $urlList = [];
    foreach (array_slice(array_values($paths), 0, 100) as $path) {
        $urlList[] = absolute_url((string)$path);
    }

    $body = json_encode([
        'host' => $host,
        'key' => $key,
        'keyLocation' => 'https://' . $host . '/' . $key . '.txt',
        'urlList' => $urlList,
    ], JSON_UNESCAPED_SLASHES);

    $context = stream_context_create(['http' => [
        'method' => 'POST',
        'header' => "Content-Type: application/json; charset=utf-8\r\n",
        'content' => $body,
        'timeout' => 6,
        'ignore_errors' => true,
    ]]);
    @file_get_contents('https://api.indexnow.org/indexnow', false, $context);

    $statusLine = (string)($http_response_header[0] ?? '');
    preg_match('/\s(\d{3})(?:\s|$)/', $statusLine, $matches);
    $code = (int)($matches[1] ?? 0);
    $ok = $code >= 200 && $code < 300;

    $result = [
        'ok' => $ok,
        'code' => $code,
        'urls' => count($urlList),
        'date' => date('c'),
        'message' => $ok
            ? 'Bing, Yandex, Naver et Seznam notifiés via IndexNow (HTTP ' . $code . '). Google lit le sitemap dynamique (lastmod).'
            : ($code === 0 ? 'IndexNow injoignable (réseau ou allow_url_fopen désactivé).' : 'Réponse IndexNow inattendue : HTTP ' . $code . '.'),
    ];

    $directory = dirname(jp_indexnow_status_file());
    if (is_dir($directory) || @mkdir($directory, 0750, true)) {
        @file_put_contents(jp_indexnow_status_file(), json_encode($result, JSON_UNESCAPED_UNICODE));
    }
    if (!$ok) {
        error_log('IndexNow ping: ' . $result['message']);
    }
    return $result;
}
