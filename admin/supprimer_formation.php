<?php

declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/connexion_db.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jp_abort(405, 'Cette suppression doit être confirmée depuis l’administration.');
}

$id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
if (!$id) {
    redirect('/admin/formations?msg=id_invalide');
}

$conn->beginTransaction();
try {
    $stmt = $conn->prepare('SELECT image FROM formations WHERE id = :id FOR UPDATE');
    $stmt->execute(['id' => $id]);
    $image = $stmt->fetchColumn();
    $delete = $conn->prepare('DELETE FROM formations WHERE id = :id');
    $delete->execute(['id' => $id]);
    $conn->commit();
    jp_safe_delete_media(is_string($image) ? $image : null);
    redirect('/admin/formations?msg=suppression_ok');
} catch (Throwable $exception) {
    if ($conn->inTransaction()) { $conn->rollBack(); }
    error_log($exception->getMessage());
    redirect('/admin/formations?msg=suppression_echec');
}
