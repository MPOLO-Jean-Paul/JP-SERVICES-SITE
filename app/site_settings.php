<?php

declare(strict_types=1);

/**
 * Paramètres éditoriaux du site, stockés en base (table site_settings)
 * et administrables depuis /admin/parametres.
 */
function jp_settings_all(PDO $conn): array
{
    static $cache = null;
    if (is_array($cache)) {
        return $cache;
    }
    $cache = [];
    try {
        $rows = $conn->query('SELECT cle, valeur FROM site_settings')->fetchAll(PDO::FETCH_KEY_PAIR);
        if (is_array($rows)) {
            $cache = array_map(static fn($value): string => (string)$value, $rows);
        }
    } catch (Throwable $exception) {
        error_log('Paramètres du site: ' . $exception->getMessage());
    }
    return $cache;
}

function jp_setting(PDO $conn, string $key, string $default = ''): string
{
    $settings = jp_settings_all($conn);
    $value = trim((string)($settings[$key] ?? ''));
    return $value !== '' ? $value : $default;
}

/**
 * Adresse publique configurée par l'administration, sinon par CONTACT_EMAIL.
 * L'adresse SMTP n'est pas exposée automatiquement : elle peut être privée.
 */
function jp_contact_email(?PDO $conn = null): string
{
    $candidates = [];
    if ($conn instanceof PDO) {
        $candidates[] = jp_setting($conn, 'contact_email');
    }
    $candidates[] = (string)env('CONTACT_EMAIL', '');
    $candidates[] = 'contact@jp-services.com';

    foreach ($candidates as $candidate) {
        $candidate = trim($candidate);
        if (strlen($candidate) <= 254 && filter_var($candidate, FILTER_VALIDATE_EMAIL)) {
            return $candidate;
        }
    }
    return 'contact@jp-services.com';
}

/** Vérifie un numéro téléphonique publiable et utilisable dans un lien tel:. */
function jp_valid_public_phone(string $phone): bool
{
    $phone = trim($phone);
    if ($phone === '' || strlen($phone) > 35 || preg_match('/^\\+?[0-9 ().-]+$/D', $phone) !== 1) {
        return false;
    }
    $digits = preg_replace('/\\D/', '', $phone);
    return strlen($digits) >= 8 && strlen($digits) <= 15;
}

/** Un lien tel: n'accepte que les chiffres et un éventuel + initial. */
function jp_phone_tel_uri(string $phone): string
{
    return (str_starts_with(trim($phone), '+') ? '+' : '') . preg_replace('/\\D/', '', $phone);
}

function jp_contact_phone(?PDO $conn = null): string
{
    $candidates = [];
    if ($conn instanceof PDO) {
        $candidates[] = jp_setting($conn, 'contact_phone');
    }
    $candidates[] = (string)env('CONTACT_PHONE', '');
    $candidates[] = '+243 977 152 825';
    foreach ($candidates as $candidate) {
        $candidate = trim($candidate);
        if (jp_valid_public_phone($candidate)) {
            return $candidate;
        }
    }
    return '+243 977 152 825';
}

/** Renvoie les chiffres internationaux à utiliser dans https://wa.me/. */
function jp_normalize_whatsapp(string $number): ?string
{
    $number = trim($number);
    if (strlen($number) > 35 || preg_match('/^\\+?[0-9 ().-]+$/D', $number) !== 1) {
        return null;
    }
    $digits = preg_replace('/\\D/', '', $number);
    return preg_match('/^[1-9][0-9]{8,14}$/D', $digits) === 1 ? $digits : null;
}

function jp_contact_whatsapp(?PDO $conn = null): string
{
    $candidates = [];
    if ($conn instanceof PDO) {
        $candidates[] = jp_setting($conn, 'contact_whatsapp');
    }
    $candidates[] = (string)env('CONTACT_WHATSAPP', '');
    $candidates[] = '243860951131';
    foreach ($candidates as $candidate) {
        $normalized = jp_normalize_whatsapp($candidate);
        if ($normalized !== null) {
            return $normalized;
        }
    }
    return '243860951131';
}
