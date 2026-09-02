<?php

declare(strict_types=1);
require_once __DIR__ . '/includes/connexion_db.php';
try {
    $produits = $conn->query('SELECT id, nom, description, prix, image_url AS image FROM produits ORDER BY id DESC')->fetchAll();
} catch (Throwable $exception) {
    error_log($exception->getMessage());
    $produits = [];
}
include __DIR__ . '/includes/header.php';
?>
<main>
<section class="home-section" style="background:linear-gradient(135deg,#fff7f9,#f3f1ff)"><div class="home-shell text-center"><span class="home-eyebrow"><i class="fas fa-box-open"></i> Catalogue</span><h2 class="display-5 fw-bold mt-3">Nos produits</h2><p class="text-muted">Une sélection de solutions et d’équipements proposés par JP-Services.</p></div></section>
<section class="home-section"><div class="home-shell"><div class="row g-4">
<?php if (!$produits): ?><div class="col-12"><div class="card p-5 text-center text-muted">Aucun produit n’est disponible actuellement.</div></div><?php endif; ?>
<?php foreach ($produits as $produit): ?><div class="col-md-6 col-lg-4"><article class="card h-100 overflow-hidden"><?php if (!empty($produit['image'])): ?><img src="<?= e(url('/' . ltrim((string)$produit['image'],'/'))) ?>" alt="<?= e($produit['nom']) ?>" style="height:240px;object-fit:cover"><?php endif; ?><div class="card-body p-4"><h3 class="h5"><?= e($produit['nom']) ?></h3><p class="text-muted"><?= e(mb_strimwidth((string)$produit['description'],0,180,'…')) ?></p><div class="fw-bold text-primary fs-5"><?= e(number_format((float)$produit['prix'],2,',',' ')) ?> $</div></div></article></div><?php endforeach; ?>
</div></div></section>
</main>
<?php include __DIR__ . '/includes/footer.php'; ?>
