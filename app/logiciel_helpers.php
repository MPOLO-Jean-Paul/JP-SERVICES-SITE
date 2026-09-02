<?php

declare(strict_types=1);

/** Taille lisible (ex. 12,4 Mo). */
function jp_logiciel_size(mixed $bytes): string
{
    $bytes = (float)$bytes;
    if ($bytes <= 0) {
        return 'Taille inconnue';
    }
    $units = ['octets', 'Ko', 'Mo', 'Go'];
    $power = (int)min(floor(log($bytes, 1024)), count($units) - 1);
    $value = $bytes / (1024 ** $power);
    $formatted = $power === 0 ? (string)(int)$value : number_format($value, 1, ',', ' ');
    return $formatted . ' ' . $units[$power];
}

function jp_logiciel_date_label(mixed $value): string
{
    $timestamp = strtotime((string)$value);
    if ($timestamp === false) {
        return '—';
    }
    $months = [1 => 'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
    return (int)date('j', $timestamp) . ' ' . $months[(int)date('n', $timestamp)] . ' ' . date('Y', $timestamp);
}

/** Téléversement d'un fichier logiciel (zip, apk, installateurs, pdf…). */
function jp_upload_software(array $file, int $maxBytes = 52428800): string
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Le téléversement du fichier a échoué.');
    }
    if (($file['size'] ?? 0) <= 0 || (int)$file['size'] > $maxBytes) {
        throw new RuntimeException('Le fichier dépasse la taille autorisée (50 Mo maximum).');
    }
    $tmp = (string)($file['tmp_name'] ?? '');
    if ($tmp === '' || !is_uploaded_file($tmp)) {
        throw new RuntimeException('Le fichier reçu n’est pas un téléversement valide.');
    }
    $originalName = (string)($file['name'] ?? '');
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $allowed = ['zip', 'apk', 'exe', 'msi', 'dmg', 'pkg', 'deb', 'rar', '7z', 'pdf'];
    if (!in_array($extension, $allowed, true)) {
        throw new RuntimeException('Format de fichier non autorisé (zip, apk, exe, msi, dmg, pkg, deb, rar, 7z, pdf).');
    }
    $directory = JP_ROOT . '/uploads/logiciels';
    if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
        throw new RuntimeException('Impossible de préparer le dossier de destination.');
    }
    $filename = bin2hex(random_bytes(16)) . '.' . $extension;
    if (!move_uploaded_file($tmp, $directory . '/' . $filename)) {
        throw new RuntimeException('Impossible d’enregistrer le fichier.');
    }
    @chmod($directory . '/' . $filename, 0644);
    return 'uploads/logiciels/' . $filename;
}

function jp_delete_software_file(?string $relativePath): void
{
    if (!$relativePath) {
        return;
    }
    $normalized = ltrim(str_replace('\\', '/', $relativePath), '/');
    if (!str_starts_with($normalized, 'uploads/logiciels/')) {
        return;
    }
    $full = realpath(JP_ROOT . '/' . $normalized);
    $root = realpath(JP_ROOT . '/uploads/logiciels');
    if ($full && $root && str_starts_with($full, $root . DIRECTORY_SEPARATOR) && is_file($full)) {
        @unlink($full);
    }
}
