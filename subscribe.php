<?php
require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/app/newsletter_helpers.php';
require_once __DIR__ . '/includes/connexion_db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/');
}

$email = strtolower(trim((string)($_POST['email'] ?? '')));
if (mb_strlen($email, 'UTF-8') > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $_SESSION['newsletter_flash'] = ['type' => 'warning', 'message' => 'Veuillez saisir une adresse e-mail valide.'];
    redirect('/#newsletter');
}

$ip = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
if (!jp_rate_limit('newsletter:' . $ip, 5, 3600)) {
    $_SESSION['newsletter_flash'] = ['type' => 'warning', 'message' => 'Trop de tentatives. Réessayez plus tard.'];
    redirect('/#newsletter');
}

$allowedThemes = array_keys(jp_newsletter_themes());
$selectedThemes = is_array($_POST['themes'] ?? null)
    ? array_values(array_intersect($allowedThemes, array_map('strval', $_POST['themes'])))
    : [];
if ($selectedThemes === []) {
    $selectedThemes = $allowedThemes;
}

try {
    $params = [
        ':email' => $email,
        ':ip' => substr($ip, 0, 45),
        ':agent' => substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 255),
    ];
    try {
        $stmt = $conn->prepare(
            'INSERT INTO newsletter_subscribers (email, ip_address, user_agent, statut, themes, date_inscription)
             VALUES (:email, :ip, :agent, \'actif\', :themes, NOW())
             ON DUPLICATE KEY UPDATE statut = \'actif\', themes = VALUES(themes), date_desinscription = NULL'
        );
        $stmt->execute($params + [':themes' => implode(',', $selectedThemes)]);
    } catch (Throwable $columnException) {
        // Colonne themes absente (MIGRATION_newsletter_prefs.sql non appliquée) : insertion standard
        if (stripos($columnException->getMessage(), 'themes') === false) {
            throw $columnException;
        }
        $stmt = $conn->prepare(
            'INSERT INTO newsletter_subscribers (email, ip_address, user_agent, statut, date_inscription)
             VALUES (:email, :ip, :agent, \'actif\', NOW())
             ON DUPLICATE KEY UPDATE statut = \'actif\', date_desinscription = NULL'
        );
        $stmt->execute($params);
    }
    $_SESSION['newsletter_flash'] = [
        'type' => 'success',
        'message' => 'Votre inscription est confirmée (' . count($selectedThemes) . ' thème' . (count($selectedThemes) > 1 ? 's' : '') . ' suivi' . (count($selectedThemes) > 1 ? 's' : '') . ').',
        'link' => jp_newsletter_prefs_url($email),
        'link_label' => 'Gérer mes préférences',
    ];
} catch (Throwable $exception) {
    error_log('Newsletter: ' . $exception->getMessage());
    $_SESSION['newsletter_flash'] = ['type' => 'danger', 'message' => 'L’inscription est momentanément indisponible.'];
}

redirect('/#newsletter');
