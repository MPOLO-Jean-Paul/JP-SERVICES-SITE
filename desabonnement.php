<?php
require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/includes/connexion_db.php';

require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/formations');
}

$formationId = filter_input(INPUT_POST, 'formation_id', FILTER_VALIDATE_INT);
if (!$formationId) {
    $_SESSION['flash_message'] = 'Action de désabonnement invalide.';
    redirect('/abonnements');
}

try {
    $stmt = $conn->prepare('DELETE FROM abonnements WHERE user_id = :uid AND formation_id = :fid');
    $stmt->execute([':uid' => (int)$_SESSION['user_id'], ':fid' => $formationId]);
    $_SESSION['flash_message'] = $stmt->rowCount() > 0
        ? 'Vous avez été désabonné de cette formation.'
        : 'Aucun abonnement actif n’a été trouvé.';
} catch (Throwable $exception) {
    error_log('Désabonnement: ' . $exception->getMessage());
    $_SESSION['flash_message'] = 'Le désabonnement n’a pas pu être effectué.';
}

redirect('/abonnements');
