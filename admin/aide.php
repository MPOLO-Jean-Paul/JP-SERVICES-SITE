<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/app/bootstrap.php';
require_admin();

$page_title = 'Aide administration';
include dirname(__DIR__) . '/includes/header_admin.php';
?>
<section class="jp-admin-page-head"><div><span>Centre d’assistance</span><h1>Aide à l’administration</h1><p>Les bons réflexes pour gérer le site avec méthode et sécurité.</p></div><a class="btn btn-outline-primary" href="<?= e(url('/aide')) ?>" target="_blank" rel="noopener noreferrer">Aide publique <i class="fas fa-arrow-up-right-from-square"></i></a></section>
<div class="jp-admin-help-grid">
    <a href="<?= e(url('/admin/utilisateurs')) ?>"><i class="fas fa-users"></i><div><h2>Utilisateurs</h2><p>Activer, suspendre et contrôler les comptes sans modifier leurs mots de passe.</p></div><i class="fas fa-chevron-right"></i></a>
    <a href="<?= e(url('/admin/formations')) ?>"><i class="fas fa-graduation-cap"></i><div><h2>Formations</h2><p>Publier des informations complètes et vérifier dates, niveaux et programmes.</p></div><i class="fas fa-chevron-right"></i></a>
    <a href="<?= e(url('/admin/messages')) ?>"><i class="fas fa-envelope"></i><div><h2>Messages</h2><p>Répondre depuis la boîte de réception avec une communication claire et traçable.</p></div><i class="fas fa-chevron-right"></i></a>
    <a href="<?= e(url('/admin/support')) ?>"><i class="fas fa-life-ring"></i><div><h2>Support</h2><p>Traiter les demandes, puis les marquer comme lues une fois examinées.</p></div><i class="fas fa-chevron-right"></i></a>
</div>
<aside class="jp-admin-security-note"><i class="fas fa-shield-halved"></i><div><h2>Règles de sécurité</h2><p>Ne partagez jamais une session administrateur, vérifiez le destinataire avant un envoi et déconnectez-vous d’un appareil partagé. JP-SERVICES ne demande aucun mot de passe par e-mail.</p></div></aside>
<?php include dirname(__DIR__) . '/includes/footer_admin.php'; ?>
