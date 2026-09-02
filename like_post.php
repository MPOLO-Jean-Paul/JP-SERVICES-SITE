<?php
require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/includes/connexion_db.php';

require_login();
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/forum');
}

$postId = filter_input(INPUT_POST, 'post_id', FILTER_VALIDATE_INT);
$liked = false;
$totalLikes = 0;

if ($postId) {
    try {
        $userId = (int)$_SESSION['user_id'];
        $exists = $conn->prepare('SELECT 1 FROM likes WHERE post_id = :post AND user_id = :user LIMIT 1');
        $exists->execute(['post' => $postId, 'user' => $userId]);
        if ($exists->fetchColumn()) {
            $stmt = $conn->prepare('DELETE FROM likes WHERE post_id = :post AND user_id = :user');
            $stmt->execute(['post' => $postId, 'user' => $userId]);
            $liked = false;
        } else {
            $stmt = $conn->prepare('INSERT INTO likes (post_id, user_id) VALUES (:post, :user)');
            $stmt->execute(['post' => $postId, 'user' => $userId]);
            $liked = true;
        }
        $countStmt = $conn->prepare('SELECT COUNT(*) FROM likes WHERE post_id = :post');
        $countStmt->execute(['post' => $postId]);
        $totalLikes = (int)$countStmt->fetchColumn();
    } catch (Throwable $exception) {
        error_log('Like publication: ' . $exception->getMessage());
    }
}

$isAjax = (!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) === 'xmlhttprequest')
    || (isset($_SERVER['HTTP_ACCEPT']) && str_contains($_SERVER['HTTP_ACCEPT'], 'application/json'));

if ($isAjax) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => true,
        'liked' => $liked,
        'total_likes' => $totalLikes,
        'label' => $totalLikes . ' appréciation' . ($totalLikes > 1 ? 's' : '')
    ]);
    exit;
}

redirect('/forum');

