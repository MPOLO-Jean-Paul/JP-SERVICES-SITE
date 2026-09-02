<?php

declare(strict_types=1);
require_once dirname(__DIR__) . '/includes/connexion_db.php';
require_admin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jp_abort(405, 'Cette action doit être confirmée depuis l’administration.');
}

$userId = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
$action = (string)($_POST['action'] ?? '');
if (!$userId || !in_array($action, ['activer', 'desactiver'], true)) {
    redirect('/admin/utilisateurs?error=parametres');
}
if ($userId === (int)$_SESSION['user_id']) {
    redirect('/admin/utilisateurs?error=auto_modification_interdite');
}

$active = $action === 'activer' ? 1 : 0;
try {
    $stmt = $conn->prepare("UPDATE users SET is_active = :active WHERE id = :id AND role <> 'admin'");
    $stmt->execute(['active' => $active, 'id' => $userId]);
    redirect('/admin/utilisateurs?success=statut_modifie');
} catch (Throwable $exception) {
    error_log('Statut utilisateur : ' . $exception->getMessage());
    redirect('/admin/utilisateurs?error=modification_impossible');
}
