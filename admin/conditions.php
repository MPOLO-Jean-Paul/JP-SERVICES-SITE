<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/app/bootstrap.php';
require_admin();

$page_title = 'Conditions d’utilisation';
include dirname(__DIR__) . '/includes/header_admin.php';
?>
<section class="jp-admin-page-head"><div><span>Référentiel</span><h1>Conditions d’utilisation</h1><p>Version de consultation pour l’équipe d’administration.</p></div><a class="btn btn-outline-primary" href="<?= e(url('/conditions')) ?>" target="_blank" rel="noopener noreferrer">Voir la page publique <i class="fas fa-arrow-up-right-from-square"></i></a></section>
<article class="jp-admin-document">
    <span class="jp-doc-kicker">Cadre d’utilisation</span>
    <h2>Acceptation des conditions</h2><p>En utilisant les services de JP-SERVICES, les utilisateurs acceptent de respecter les présentes conditions et d’utiliser les espaces proposés de manière légale et responsable.</p>
    <h2>Utilisation des services</h2><p>Les outils, formations et plateformes doivent être utilisés conformément à leur finalité. Toute tentative d’accès non autorisé, d’altération ou d’usage abusif est interdite.</p>
    <h2>Propriété intellectuelle</h2><p>Les logiciels, identités visuelles et contenus produits par JP-SERVICES restent protégés. Leur mise à disposition n’emporte aucun transfert de propriété.</p>
</article>
<?php include dirname(__DIR__) . '/includes/footer_admin.php'; ?>
