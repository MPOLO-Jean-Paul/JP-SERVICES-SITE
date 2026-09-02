<?php

declare(strict_types=1);
require_once __DIR__ . '/includes/connexion_db.php';
require_login();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jp_abort(405, 'Cette suppression doit être confirmée depuis le forum.');
}

$postId = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
if (!$postId) {
    redirect('/forum');
}

$stmt = $conn->prepare('DELETE FROM posts WHERE id = :id AND auteur_id = :user_id');
$stmt->execute(['id' => $postId, 'user_id' => (int)$_SESSION['user_id']]);
redirect('/forum?deleted=1');
