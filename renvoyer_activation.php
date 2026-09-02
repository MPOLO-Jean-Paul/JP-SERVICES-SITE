<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/connexion_db.php';
require_once __DIR__ . '/app/auth_mailer.php';

header('Cache-Control: no-store, private');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/activation/attente');
}

$email = strtolower(trim((string)($_SESSION['pending_activation_email'] ?? '')));
if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    redirect('/inscription');
}

if (!jp_rate_limit('activation-resend-ip:' . (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown'), 3, 900)
    || !jp_rate_limit('activation-resend-email:' . hash('sha256', $email), 3, 900)) {
    $_SESSION['activation_flash'] = 'Trop de demandes ont été effectuées. Réessayez dans quelques minutes.';
    redirect('/activation/attente');
}

try {
    $account = $conn->prepare('SELECT id FROM users WHERE email = :email AND is_active = 1 LIMIT 1');
    $account->execute(['email' => $email]);
    if ($account->fetchColumn()) {
        unset($_SESSION['pending_activation_email']);
        $_SESSION['security_flash'] = 'Votre compte est déjà actif. Vous pouvez vous connecter.';
        redirect('/connexion');
    }

    $pendingQuery = $conn->prepare('SELECT id, prenom, token, date_demande FROM temp_users WHERE email = :email LIMIT 1');
    $pendingQuery->execute(['email' => $email]);
    $pending = $pendingQuery->fetch(PDO::FETCH_ASSOC);
    if (!is_array($pending)) {
        $_SESSION['activation_flash'] = 'Aucune inscription en attente n’a été trouvée. Recommencez l’inscription.';
        redirect('/activation/attente');
    }

    $rawToken = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
    $tokenHash = hash('sha256', $rawToken);
    $refresh = $conn->prepare('UPDATE temp_users SET token = :token, date_demande = NOW() WHERE id = :id');
    $refresh->execute(['token' => $tokenHash, 'id' => (int)$pending['id']]);

    try {
        jp_send_activation_email($email, (string)$pending['prenom'], $rawToken);
        $_SESSION['activation_flash'] = 'Un nouvel e-mail d’activation vient de vous être envoyé.';
    } catch (Throwable) {
        // Rétablit le précédent jeton si possible : un échec d’e-mail ne doit pas
        // supprimer le dernier lien que l’utilisateur a effectivement reçu.
        try {
            $restore = $conn->prepare('UPDATE temp_users SET token = :old_token, date_demande = :old_date WHERE id = :id AND token = :new_token');
            $restore->execute([
                'old_token' => (string)$pending['token'],
                'old_date' => (string)$pending['date_demande'],
                'id' => (int)$pending['id'],
                'new_token' => $tokenHash,
            ]);
        } catch (Throwable) {
            error_log('Activation resend: restauration de jeton impossible.');
        }
        error_log('Activation resend: envoi e-mail impossible.');
        $_SESSION['activation_flash'] = 'L’e-mail n’a pas pu être envoyé pour le moment. Réessayez dans quelques minutes.';
    }
} catch (Throwable) {
    error_log('Activation resend: traitement indisponible.');
    $_SESSION['activation_flash'] = 'Le nouvel envoi est momentanément indisponible. Réessayez plus tard.';
}

redirect('/activation/attente');
