<?php
require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/includes/connexion_db.php';
require_login();

$userId = (int)$_SESSION['user_id'];
$stmt = $conn->prepare('SELECT nom, prenom, email, role, photo_profil, mot_de_passe FROM users WHERE id = :id LIMIT 1');
$stmt->execute([':id' => $userId]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);
if (!$user) {
    $_SESSION = [];
    session_regenerate_id(true);
    redirect('/connexion');
}

$message = '';
$statusType = 'success';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nom = trim((string)($_POST['nom'] ?? ''));
    $prenom = trim((string)($_POST['prenom'] ?? ''));
    $email = strtolower(trim((string)($_POST['email'] ?? '')));
    $emailChanged = $email !== strtolower((string)$user['email']);
    $currentPassword = (string)($_POST['current_password'] ?? '');
    $newPassword = (string)($_POST['new_password'] ?? '');
    $confirmPassword = (string)($_POST['confirm_password'] ?? '');
    $newPhoto = null;

    if ($nom === '' || $prenom === '' || mb_strlen($nom, 'UTF-8') > 100 || mb_strlen($prenom, 'UTF-8') > 100 || mb_strlen($email, 'UTF-8') > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $message = 'Renseignez un nom, un prénom et une adresse e-mail valide.';
        $statusType = 'danger';
    } elseif (($emailChanged || $newPassword !== '') && !password_verify($currentPassword, (string)$user['mot_de_passe'])) {
        $message = 'Confirmez votre mot de passe actuel pour modifier l’adresse e-mail ou le mot de passe.';
        $statusType = 'danger';
    } elseif (($newPassword !== '' || $confirmPassword !== '') && $newPassword !== $confirmPassword) {
        $message = 'Le nouveau mot de passe et sa confirmation doivent être identiques.';
        $statusType = 'danger';
    } elseif ($newPassword !== '' && ($passwordError = jp_password_policy($newPassword)) !== null) {
        $message = $passwordError;
        $statusType = 'danger';
    } else {
        try {
            if (isset($_FILES['photo']) && ($_FILES['photo']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_NO_FILE) {
                $newPhoto = jp_upload_image($_FILES['photo'], 'images/profils', 4 * 1024 * 1024);
            }

            $conn->beginTransaction();
            $duplicate = $conn->prepare('SELECT id FROM users WHERE email = :email AND id <> :id LIMIT 1');
            $duplicate->execute([':email' => $email, ':id' => $userId]);
            if ($duplicate->fetchColumn()) {
                throw new DomainException('Cette adresse e-mail est déjà utilisée.');
            }

            $photoPath = $newPhoto ?: (string)$user['photo_profil'];
            $sql = 'UPDATE users SET nom = :nom, prenom = :prenom, email = :email, photo_profil = :photo';
            $params = [':nom' => $nom, ':prenom' => $prenom, ':email' => $email, ':photo' => $photoPath, ':id' => $userId];
            if ($newPassword !== '') {
                $sql .= ', mot_de_passe = :password';
                $params[':password'] = password_hash($newPassword, PASSWORD_DEFAULT);
            }
            $sql .= ' WHERE id = :id';
            $update = $conn->prepare($sql);
            $update->execute($params);
            $conn->commit();

            if ($newPhoto && !empty($user['photo_profil'])) {
                jp_safe_delete_media((string)$user['photo_profil']);
            }
            $user = array_merge($user, ['nom' => $nom, 'prenom' => $prenom, 'email' => $email, 'photo_profil' => $photoPath]);
            $_SESSION['nom'] = $nom;
            $_SESSION['prenom'] = $prenom;
            $_SESSION['user_nom'] = $nom;
            $_SESSION['user_prenom'] = $prenom;
            if ($newPassword !== '' || $emailChanged) {
                session_regenerate_id(true);
                $_SESSION['_last_rotation'] = time();
            }
            $message = 'Votre profil a été mis à jour avec succès.';
        } catch (DomainException $exception) {
            if ($conn->inTransaction()) $conn->rollBack();
            if ($newPhoto) jp_safe_delete_media($newPhoto);
            $message = $exception->getMessage();
            $statusType = 'danger';
        } catch (Throwable $exception) {
            if ($conn->inTransaction()) $conn->rollBack();
            if ($newPhoto) jp_safe_delete_media($newPhoto);
            error_log('Modification profil: ' . $exception->getMessage());
            $message = 'La mise à jour du profil n’a pas pu être enregistrée.';
            $statusType = 'danger';
        }
    }
}

$photo = !empty($user['photo_profil']) ? (string)$user['photo_profil'] : 'images/default-avatar.svg';
?>
<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Modifier mon profil | JP-SERVICES</title>
</head><body>
<?php include __DIR__ . '/includes/header.php'; ?>
<main class="container py-5"><div class="mx-auto" style="max-width:900px"><div class="jp-surface overflow-hidden"><div class="p-4 p-md-5 text-white" style="background:linear-gradient(135deg,var(--jp-primary),var(--jp-secondary))"><span class="jp-eyebrow text-white">Compte personnel</span><h1 class="mb-2">Modifier mon profil</h1><p class="mb-0 opacity-75">Gardez vos coordonnées et vos accès à jour.</p></div><div class="p-4 p-md-5">
<?php if ($message !== ''): ?><div class="alert alert-<?= e($statusType) ?>"><?= e($message) ?></div><?php endif; ?>
<form method="post" enctype="multipart/form-data">
    <div class="row g-4">
        <div class="col-md-4 text-center">
            <img id="profilePreview" src="<?= e(url('/' . ltrim($photo, '/'))) ?>" alt="Photo de profil" width="150" height="150" class="rounded-circle object-fit-cover border shadow-sm">
            <label for="photo" class="jp-btn jp-btn-secondary mt-3 d-inline-flex"><i class="fa-solid fa-camera me-2"></i>Changer la photo</label>
            <input class="d-none" type="file" id="photo" name="photo" accept="image/jpeg,image/png,image/webp,image/gif">
            <small class="d-block text-muted mt-2">JPG, PNG, WebP ou GIF — 4 Mo maximum.</small>
        </div>
        <div class="col-md-8"><div class="row g-3">
            <div class="col-md-6"><label class="form-label" for="prenom">Prénom</label><input class="form-control" id="prenom" name="prenom" maxlength="100" value="<?= e($user['prenom']) ?>" required></div>
            <div class="col-md-6"><label class="form-label" for="nom">Nom</label><input class="form-control" id="nom" name="nom" maxlength="100" value="<?= e($user['nom']) ?>" required></div>
            <div class="col-12"><label class="form-label" for="email">Adresse e-mail</label><input class="form-control" type="email" id="email" name="email" maxlength="190" value="<?= e($user['email']) ?>" required></div>
            <div class="col-12"><hr><h2 class="h5">Sécurité du compte</h2><p class="text-muted small">Votre mot de passe actuel est obligatoire pour modifier l’adresse e-mail ou choisir un nouveau mot de passe.</p></div>
            <div class="col-12"><label class="form-label" for="current_password">Mot de passe actuel</label><input class="form-control" type="password" id="current_password" name="current_password" maxlength="512" autocomplete="current-password"></div>
            <div class="col-md-6"><label class="form-label" for="new_password">Nouveau mot de passe</label><input class="form-control" type="password" id="new_password" name="new_password" minlength="10" maxlength="128" autocomplete="new-password" data-password-field></div>
            <div class="col-md-6"><label class="form-label" for="confirm_password">Confirmation</label><input class="form-control" type="password" id="confirm_password" name="confirm_password" minlength="10" maxlength="128" autocomplete="new-password" data-password-field></div>
        </div></div>
    </div>
    <div class="d-flex flex-wrap gap-2 justify-content-end mt-4"><a class="jp-btn jp-btn-secondary" href="<?= e(app_route('/profil')) ?>">Annuler</a><button class="jp-btn jp-btn-primary" type="submit">Enregistrer les modifications</button></div>
</form></div></div></div></main>
<script>document.getElementById('photo')?.addEventListener('change',function(){const f=this.files?.[0];if(f&&f.type.startsWith('image/'))document.getElementById('profilePreview').src=URL.createObjectURL(f);});</script>
<?php include __DIR__ . '/includes/footer.php'; ?></body></html>
