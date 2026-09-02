<?php

declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/connexion_db.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jp_abort(405, 'Cette suppression doit être confirmée depuis l’administration.');
}

$id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    redirect('/admin/actualites');
}

$conn->beginTransaction();
try {
    $column = jp_actualite_media_column($conn);
    $stmt = $conn->prepare("SELECT {$column} FROM actualites WHERE id = :id FOR UPDATE");
    $stmt->execute(['id' => $id]);
    $media = $stmt->fetchColumn();
    $delete = $conn->prepare('DELETE FROM actualites WHERE id = :id');
    $delete->execute(['id' => $id]);
    $conn->commit();
    jp_safe_delete_media(is_string($media) ? $media : null);
    redirect('/admin/actualites?message=deleted');
} catch (Throwable $exception) {
    if ($conn->inTransaction()) { $conn->rollBack(); }
    error_log($exception->getMessage());
    redirect('/admin/actualites?error=delete');
}
