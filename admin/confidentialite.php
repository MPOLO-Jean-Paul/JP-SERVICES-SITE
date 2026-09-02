<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/app/bootstrap.php';
require_admin();

$page_title = 'Politique de confidentialité';
include dirname(__DIR__) . '/includes/header_admin.php';
?>
<section class="jp-admin-page-head"><div><span>Protection des données</span><h1>Politique de confidentialité</h1><p>Repères essentiels pour le traitement responsable des données.</p></div><a class="btn btn-outline-primary" href="<?= e(url('/confidentialite')) ?>" target="_blank" rel="noopener noreferrer">Voir la page publique <i class="fas fa-arrow-up-right-from-square"></i></a></section>
<article class="jp-admin-document">
    <span class="jp-doc-kicker">Dernière mise à jour · août 2026</span>
    <h2>Données strictement nécessaires</h2><p>JP-SERVICES collecte uniquement les informations nécessaires à la gestion des comptes, des inscriptions, des projets et de l’assistance. Elles ne doivent pas être réutilisées hors de ces finalités.</p>
    <h2>Accès administrateur</h2><p>L’accès aux informations personnelles est réservé aux administrateurs autorisés. Les exports, copies et transmissions non justifiés par le service sont interdits.</p>
    <h2>Sécurité et conservation</h2><p>Les mots de passe sont hachés, les formulaires sont protégés et les sessions sensibles ne sont pas mises en cache. Les données doivent être supprimées lorsqu’elles ne sont plus utiles ou lorsqu’une obligation applicable l’exige.</p>
</article>
<?php include dirname(__DIR__) . '/includes/footer_admin.php'; ?>
