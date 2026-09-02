<?php
require_once dirname(__DIR__) . '/app/bootstrap.php';
require_admin();

require_once '../includes/connexion_db.php';
$page_title = "Console d'administration";
include '../includes/header_admin.php'; 

// Récupération de quelques statistiques rapides pour le "look & feel" professionnel
try {
    $countUsers = (int)$conn->query("SELECT COUNT(*) FROM users")->fetchColumn();
    $countNotifs = (int)$conn->query("SELECT COUNT(*) FROM notifications")->fetchColumn();
} catch (Throwable $exception) {
    error_log('Statistiques administration : ' . $exception->getMessage());
    $countUsers = $countNotifs = 0;
}
?>

<style>
    :root {
        --google-blue: #1a73e8;
        --google-green: #1e8e3e;
        --google-red: #d93025;
        --google-yellow: #f9ab00;
        --bg-gray: #f8f9fa;
        --text-main: #202124;
        --text-sub: #5f6368;
        --border-color: #dadce0;
    }

    body {
        background-color: var(--bg-gray);
        font-family: 'Roboto', sans-serif;
        color: var(--text-main);
    }

    h1, h5, .btn-google {
        font-family: 'Google Sans', sans-serif;
    }

    .admin-header {
        padding: 40px 0;
        background: white;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 40px;
    }

    /* Cartes style Google Cloud / Admin */
    .g-card {
        background: white;
        border: 1px solid var(--border-color);
        border-radius: 12px;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        text-decoration: none !important;
        color: inherit !important;
        display: block;
        height: 100%;
    }

    .g-card:hover {
        box-shadow: 0 4px 12px 0 rgba(60,64,67,0.15);
        border-color: transparent;
        transform: translateY(-2px);
    }

    .icon-wrapper {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 20px;
    }

    /* Boutons style Google */
    .btn-google {
        border-radius: 20px;
        padding: 8px 24px;
        font-size: 14px;
        font-weight: 500;
        text-transform: none;
        transition: background 0.2s;
    }

    .stat-pill {
        font-size: 12px;
        padding: 4px 12px;
        background: #f1f3f4;
        border-radius: 100px;
        color: var(--text-sub);
    }
</style>

<div class="admin-header">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-md-8 text-center text-md-start">
                <h1 class="display-6 fw-bold mb-1">Console d'administration</h1>
                <p class="text-muted mb-0">
                    Bienvenue, <span class="text-primary fw-medium"><?= htmlspecialchars($_SESSION['user_nom'] ?? 'Administrateur'); ?></span>. 
                    Voici l'état de votre système.
                </p>
            </div>
            <div class="col-md-4 text-center text-md-end mt-3 mt-md-0">
                <span class="stat-pill"><i class="fas fa-clock me-2"></i>Dernière connexion : <?= date('H:i') ?></span>
            </div>
        </div>
    </div>
</div>

<div class="container mb-5">
    <div class="row g-4">
        
        <div class="col-md-4">
            <a href="gestion_utilisateurs.php" class="g-card p-4">
                <div class="icon-wrapper" style="background: rgba(26, 115, 232, 0.1);">
                    <i class="fas fa-users-cog fa-xl" style="color: var(--google-blue);"></i>
                </div>
                <h5 class="fw-bold mb-2">Utilisateurs</h5>
                <p class="small text-muted mb-4">Gérez les accès, les rôles JP-Services et les comptes en attente.</p>
                <div class="d-flex justify-content-between align-items-center mt-auto">
                    <span class="btn-google text-primary" style="background: rgba(26, 115, 232, 0.05);">Ouvrir</span>
                    <span class="small fw-bold text-muted"><?= $countUsers ?> inscrits</span>
                </div>
            </a>
        </div>

        <div class="col-md-4">
            <a href="gestion_produits.php" class="g-card p-4">
                <div class="icon-wrapper" style="background: rgba(30, 142, 62, 0.1);">
                    <i class="fas fa-graduation-cap fa-xl" style="color: var(--google-green);"></i>
                </div>
                <h5 class="fw-bold mb-2">Catalogue </h5>
                <p class="small text-muted mb-4">Mettez à jour les programmes, les tarifs et les nouveaux services </p>
                <div class="d-flex justify-content-between align-items-center mt-auto">
                    <span class="btn-google text-success" style="background: rgba(30, 142, 62, 0.05);">Gérer</span>
                    <i class="fas fa-arrow-right text-muted small"></i>
                </div>
            </a>
        </div>
  <div class="col-md-4">
            <a href="membre.php" class="g-card p-4">
                <div class="icon-wrapper" style="background: rgba(26, 115, 232, 0.1);">
                    <i class="fas fa-users-cog fa-xl" style="color: var(--google-blue);"></i>
                </div>
                <h5 class="fw-bold mb-2">Gestion des membres</h5>
                <p class="small text-muted mb-4">Gérez les accès, les rôles de chaque membres de l'équipe </p>
                <div class="d-flex justify-content-between align-items-center mt-auto">
                    <span class="btn-google text-primary" style="background: rgba(26, 115, 232, 0.05);">Ouvrir</span>
                </div>
            </a>
        </div>
        <div class="col-md-4">
            <a href="messages.php" class="g-card p-4">
                <div class="icon-wrapper" style="background: rgba(249, 171, 0, 0.1);">
                    <i class="fas fa-paper-plane fa-xl" style="color: var(--google-yellow);"></i>
                </div>
                <h5 class="fw-bold mb-2">Communications</h5>
                <p class="small text-muted mb-4">Diffusez des alertes ou gérez les abonnements aux notifications.</p>
                <div class="d-flex justify-content-between align-items-center mt-auto">
                    <span class="btn-google" style="background: rgba(249, 171, 0, 0.05); color: #e37400;">Diffuser</span>
                    <span class="small fw-bold text-muted"><?= $countNotifs ?> envois</span>
                </div>
            </a>
        </div>

        <div class="col-md-4">
            <a href="support.php" class="g-card p-4">
                <div class="icon-wrapper" style="background: rgba(217, 48, 37, 0.1);">
                    <i class="fas fa-headset fa-xl" style="color: var(--google-red);"></i>
                </div>
                <h5 class="fw-bold mb-2">Centre de Support</h5>
                <p class="small text-muted mb-4">Consultez les demandes d’aide et assurez leur suivi.</p>
                <div class="d-flex justify-content-between align-items-center mt-auto">
                    <span class="btn-google text-danger" style="background: rgba(217, 48, 37, 0.05);">Répondre</span>
                </div>
            </a>
        </div>

        <div class="col-md-4">
            <a href="gestion_logiciels.php" class="g-card p-4">
                <div class="icon-wrapper" style="background: rgba(30, 142, 62, 0.1);">
                    <i class="fas fa-download fa-xl" style="color: var(--google-green);"></i>
                </div>
                <h5 class="fw-bold mb-2">Logiciels</h5>
                <p class="small text-muted mb-4">Publiez les fichiers téléchargeables, catégories et versions de l’onglet Logiciels.</p>
                <div class="d-flex justify-content-between align-items-center mt-auto">
                    <span class="btn-google text-success" style="background: rgba(30, 142, 62, 0.05);">Gérer</span>
                    <i class="fas fa-arrow-right text-muted small"></i>
                </div>
            </a>
        </div>

        <div class="col-md-4">
            <a href="gestion_partenariats.php" class="g-card p-4">
                <div class="icon-wrapper" style="background: rgba(26, 115, 232, 0.1);">
                    <i class="fas fa-handshake fa-xl" style="color: var(--google-blue);"></i>
                </div>
                <h5 class="fw-bold mb-2">Partenariats</h5>
                <p class="small text-muted mb-4">Présentez vos partenaires et suivez les demandes de collaboration reçues.</p>
                <div class="d-flex justify-content-between align-items-center mt-auto">
                    <span class="btn-google text-primary" style="background: rgba(26, 115, 232, 0.05);">Ouvrir</span>
                    <i class="fas fa-arrow-right text-muted small"></i>
                </div>
            </a>
        </div>

        <div class="col-md-4">
            <a href="gestion_live.php" class="g-card p-4">
                <div class="icon-wrapper" style="background: rgba(217, 48, 37, 0.1);">
                    <i class="fas fa-video fa-xl" style="color: var(--google-red);"></i>
                </div>
                <h5 class="fw-bold mb-2">Formations en ligne</h5>
                <p class="small text-muted mb-4">Créez des salles de visioconférence et partagez les liens d’invitation.</p>
                <div class="d-flex justify-content-between align-items-center mt-auto">
                    <span class="btn-google text-danger" style="background: rgba(217, 48, 37, 0.05);">Animer</span>
                    <i class="fas fa-arrow-right text-muted small"></i>
                </div>
            </a>
        </div>

        <div class="col-md-4">
            <a href="parametres.php" class="g-card p-4">
                <div class="icon-wrapper" style="background: rgba(249, 171, 0, 0.1);">
                    <i class="fas fa-gear fa-xl" style="color: var(--google-yellow);"></i>
                </div>
                <h5 class="fw-bold mb-2">Paramètres du site</h5>
                <p class="small text-muted mb-4">Bandeau d’annonce et textes d’introduction des pages Logiciels et Partenariat.</p>
                <div class="d-flex justify-content-between align-items-center mt-auto">
                    <span class="btn-google" style="background: rgba(249, 171, 0, 0.05); color: #e37400;">Ajuster</span>
                    <i class="fas fa-arrow-right text-muted small"></i>
                </div>
            </a>
        </div>

    </div>
</div>

<?php 
if (file_exists('../includes/footer_admin.php')) {
    include '../includes/footer_admin.php'; 
} else {
    echo "</body></html>";
}
?>
