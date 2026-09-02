<?php

declare(strict_types=1);

/**
 * Point de terminaison interne du bouton Google Identity Services.
 * Le jeton est vérifié localement avec les certificats publics Google :
 * aucun secret OAuth ne transite vers le navigateur ni n’est nécessaire ici.
 */

require_once __DIR__ . '/includes/connexion_db.php';
require_once __DIR__ . '/app/google_identity.php';

header('Cache-Control: no-store, private');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect('/connexion');
}

if ((string)($_POST['google_callback'] ?? '') !== '1' || !csrf_is_valid()) {
    $_SESSION['security_flash'] = 'La vérification de sécurité a expiré. Rechargez la page puis recommencez.';
    redirect('/connexion');
}

if (!jp_google_is_configured()) {
    $_SESSION['security_flash'] = 'La connexion Google n’est pas disponible pour le moment.';
    redirect('/connexion');
}

$credential = trim((string)($_POST['credential'] ?? ''));
if ($credential === '' || strlen($credential) > 8192) {
    $_SESSION['security_flash'] = 'Impossible de lire votre preuve de connexion Google. Veuillez réessayer.';
    redirect('/connexion');
}

$ipAddress = (string)($_SERVER['REMOTE_ADDR'] ?? 'unknown');
if (!jp_rate_limit('google-auth:' . $ipAddress, 15, 900)) {
    $_SESSION['security_flash'] = 'Trop de tentatives de connexion. Réessayez dans quelques minutes.';
    redirect('/connexion');
}

$claims = jp_google_verify_id_token($credential);
if ($claims === null) {
    error_log('Google auth: ID token refusé.');
    $_SESSION['security_flash'] = 'Impossible de valider votre identité Google. Rechargez la page puis réessayez.';
    redirect('/connexion');
}

$googleId = (string)$claims['sub'];
$email = (string)$claims['email'];
if (!jp_rate_limit('google-auth-email:' . hash('sha256', $email), 10, 900)) {
    $_SESSION['security_flash'] = 'Trop de tentatives pour ce compte. Réessayez dans quelques minutes.';
    redirect('/connexion');
}

$givenName = trim((string)($claims['given_name'] ?? ''));
$familyName = trim((string)($claims['family_name'] ?? ''));
$fullName = trim((string)($claims['name'] ?? ''));
if ($familyName === '' && $fullName !== '') {
    $parts = preg_split('/\s+/u', $fullName) ?: [];
    $givenName = $givenName !== '' ? $givenName : (string)($parts[0] ?? '');
    $familyName = count($parts) > 1 ? (string)end($parts) : $fullName;
}
if ($givenName === '') {
    $givenName = (string)(strstr($email, '@', true) ?: 'Membre');
}
if ($familyName === '') {
    $familyName = 'JP-Services';
}
$givenName = mb_substr($givenName, 0, 100, 'UTF-8');
$familyName = mb_substr(mb_strtoupper($familyName, 'UTF-8'), 0, 100, 'UTF-8');

try {
    $conn->beginTransaction();

    $findByGoogleId = $conn->prepare('SELECT id, nom, prenom, role, is_active, google_id, auth_provider FROM users WHERE google_id = :google_id LIMIT 1 FOR UPDATE');
    $findByGoogleId->execute(['google_id' => $googleId]);
    $user = $findByGoogleId->fetch(PDO::FETCH_ASSOC);

    if ($user === false) {
        $findByEmail = $conn->prepare('SELECT id, nom, prenom, role, is_active, google_id, auth_provider FROM users WHERE email = :email LIMIT 1 FOR UPDATE');
        $findByEmail->execute(['email' => $email]);
        $user = $findByEmail->fetch(PDO::FETCH_ASSOC);

        if (is_array($user)) {
            if ((int)$user['is_active'] !== 1) {
                $conn->rollBack();
                $_SESSION['security_flash'] = 'Ce compte n’est pas disponible pour le moment.';
                redirect('/connexion');
            }

            $linkedGoogleId = trim((string)($user['google_id'] ?? ''));
            if ($linkedGoogleId !== '' && !hash_equals($linkedGoogleId, $googleId)) {
                $conn->rollBack();
                $_SESSION['security_flash'] = 'Ce compte est déjà associé à une autre identité Google.';
                redirect('/connexion');
            }

            // Google garantit l’autorité des adresses Gmail et des domaines Workspace
            // vérifiés. Pour les autres adresses, une connexion par mot de passe reste
            // nécessaire afin d’éviter une association automatique trop large.
            if (!jp_google_email_is_authoritative($claims)) {
                $conn->rollBack();
                $_SESSION['security_flash'] = 'Pour cette adresse, connectez-vous d’abord avec votre mot de passe JP-Services.';
                redirect('/connexion');
            }

            $linkAccount = $conn->prepare("UPDATE users SET google_id = :google_id, auth_provider = CASE WHEN auth_provider IS NULL OR auth_provider = '' OR auth_provider = 'local' THEN 'both' ELSE auth_provider END WHERE id = :id AND google_id IS NULL");
            $linkAccount->execute(['google_id' => $googleId, 'id' => (int)$user['id']]);
            if ($linkAccount->rowCount() !== 1) {
                throw new RuntimeException('Association Google concurrente.');
            }
            $user['google_id'] = $googleId;
        } else {
            $randomPassword = password_hash(bin2hex(random_bytes(32)), PASSWORD_DEFAULT);
            if (!is_string($randomPassword)) {
                throw new RuntimeException('Impossible de préparer le compte Google.');
            }

            $createAccount = $conn->prepare("INSERT INTO users (nom, prenom, email, mot_de_passe, role, is_active, google_id, auth_provider, photo_profil, date_inscription) VALUES (:nom, :prenom, :email, :password, 'utilisateur', 1, :google_id, 'google', 'images/default-avatar.svg', NOW())");
            $createAccount->execute([
                'nom' => $familyName,
                'prenom' => $givenName,
                'email' => $email,
                'password' => $randomPassword,
                'google_id' => $googleId,
            ]);
            $user = [
                'id' => (int)$conn->lastInsertId(),
                'nom' => $familyName,
                'prenom' => $givenName,
                'role' => 'utilisateur',
                'is_active' => 1,
                'google_id' => $googleId,
            ];
        }
    }

    if ((int)$user['is_active'] !== 1) {
        $conn->rollBack();
        $_SESSION['security_flash'] = 'Ce compte n’est pas disponible pour le moment.';
        redirect('/connexion');
    }

    $conn->commit();
} catch (Throwable $exception) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    error_log('Google auth DB: ' . $exception->getMessage());
    $_SESSION['security_flash'] = 'Un problème est survenu pendant la connexion Google. Veuillez réessayer.';
    redirect('/connexion');
}

jp_start_user_session(
    (int)$user['id'],
    (string)$user['nom'],
    (string)($user['prenom'] ?? $givenName),
    (string)$user['role']
);
redirect(jp_take_login_destination((string)$user['role']));
