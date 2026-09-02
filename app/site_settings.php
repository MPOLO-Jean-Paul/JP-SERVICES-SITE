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
