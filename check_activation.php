<?php

declare(strict_types=1);
require_once __DIR__ . '/includes/connexion_db.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

$email = (string)($_SESSION['pending_activation_email'] ?? '');
$active = false;
if ($email !== '') {
    try {
        $stmt = $conn->prepare('SELECT 1 FROM users WHERE email = :email AND is_active = 1 LIMIT 1');
        $stmt->execute(['email' => $email]);
        $active = (bool)$stmt->fetchColumn();
        if ($active) {
            unset($_SESSION['pending_activation_email']);
        }
    } catch (Throwable $exception) {
        error_log($exception->getMessage());
    }
}

echo json_encode(['active' => $active], JSON_THROW_ON_ERROR);
