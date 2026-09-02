<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/includes/connexion_db.php';

$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    redirect('/logiciels');
}

try {
    $stmt = $conn->prepare('SELECT * FROM logiciels WHERE id = :id AND statut = "publie" LIMIT 1');
    $stmt->execute([':id' => $id]);
    $logiciel = $stmt->fetch(PDO::FETCH_ASSOC);
} catch (Throwable $exception) {
    error_log('Téléchargement logiciel: ' . $exception->getMessage());
    jp_abort(503, 'Le téléchargement est momentanément indisponible.');
}

if (!$logiciel) {
    jp_abort(404, 'Ce logiciel est introuvable.');
}

try {
    $conn->prepare('UPDATE logiciels SET telechargements = telechargements + 1 WHERE id = :id')->execute([':id' => $id]);
} catch (Throwable $exception) {
    error_log('Compteur téléchargement: ' . $exception->getMessage());
}

$fichier = trim((string)$logiciel['fichier']);
$lienExterne = trim((string)$logiciel['lien_externe']);

if ($fichier !== '') {
    $normalized = ltrim(str_replace('\\', '/', $fichier), '/');
    $full = realpath(JP_ROOT . '/' . $normalized);
    $root = realpath(JP_ROOT . '/uploads/logiciels');
    if (!$full || !$root || !str_starts_with($full, $root . DIRECTORY_SEPARATOR) || !is_file($full)) {
        jp_abort(404, 'Le fichier de ce logiciel est indisponible.');
    }
    while (ob_get_level() > 0) {
        ob_end_clean();
    }
    $extension = strtolower(pathinfo($full, PATHINFO_EXTENSION));
    $baseName = preg_replace('/[^a-z0-9]+/i', '-', (string)$logiciel['nom']) ?: 'logiciel';
    $downloadName = trim($baseName, '-') . ($logiciel['version'] !== '' ? '-' . preg_replace('/[^a-z0-9.\-]+/i', '', (string)$logiciel['version']) : '') . '.' . $extension;
    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . $downloadName . '"');
    header('Content-Length: ' . filesize($full));
    header('Cache-Control: private, max-age=0, must-revalidate');
    readfile($full);
    exit;
}

if ($lienExterne !== '' && filter_var($lienExterne, FILTER_VALIDATE_URL) && preg_match('~^https?://~i', $lienExterne)) {
    redirect($lienExterne, 303);
}

jp_abort(404, 'Aucun fichier n’est associé à ce logiciel.');
