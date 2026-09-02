<?php

declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/connexion_db.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jp_abort(405, 'Cette suppression doit être confirmée depuis l’administration.');
}

$userId = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
if (!$userId || $userId === (int)$_SESSION['user_id']) {
    redirect('/admin/utilisateurs?error=suppression_interdite');
}

try {
    $stmt = $conn->prepare("DELETE FROM users WHERE id = :id AND role <> 'admin'");
    $stmt->execute(['id' => $userId]);
    redirect('/admin/utilisateurs?success=utilisateur_supprime');
} catch (Throwable $exception) {
    error_log('Suppression utilisateur : ' . $exception->getMessage());
    redirect('/admin/utilisateurs?error=suppression_impossible');
}
