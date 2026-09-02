<?php
require_once __DIR__ . '/app/bootstrap.php';
require_once 'includes/connexion_db.php';

// Récupération des membres de l'équipe
try {
    $stmt = $conn->query("SELECT * FROM equipe ORDER BY ordre ASC, nom ASC");
    $membres = $stmt->fetchAll(PDO::FETCH_ASSOC);
} catch (PDOException $e) {
    $membres = []; // En cas d'erreur
}
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>A propos de nous </title>
    <link rel="icon" href="images/logo2.png" type="image/png" />

<style>
        :root {
            --primary-blue: #0061ff;
            --soft-bg: #f8fafc;
            --text-dark: #0f172a;
            --text-muted: #64748b;
        }

        body { 
            font-family: 'Plus Jakarta Sans', sans-serif; 
            background-color: #ffffff;
            color: var(--text-dark);
        }

        /* --- HERO MODERNISÉ --- */
        .about-hero {
            background: linear-gradient(135deg, #f8fbff 0%, #e0e7ff 100%);
            padding: 120px 0 80px;
            text-align: center;
            border-bottom: 1px solid rgba(0,0,0,0.05);
        }

        .about-hero h1 {
            font-family: 'Outfit', sans-serif;
            font-weight: 900;
            font-size: 1.5rem;
            letter-spacing: -1.5px;
            color: var(--text-dark);
        }

        /* --- SECTIONS TEXTE --- */
        .glass-section {
            background: #ffffff;
            border: 1px solid #f1f5f9;
            border-radius: 32px;
            padding: 50px;
            margin-bottom: 40px;
            transition: all 0.3s ease;
        }

        .glass-section:hover {
            box-shadow: 0 20px 40px rgba(0,0,0,0.04);
        }

        .section-badge {
            display: inline-block;
            padding: 6px 16px;
            background: rgba(0, 97, 255, 0.1);
            color: var(--primary-blue);
            border-radius: 100px;
            font-size: 0.75rem;
            font-weight: 800;
            text-transform: uppercase;
            margin-bottom: 20px;
        }

        /* --- TEAM CARDS (Ultra Pro) --- */
        .team-grid { margin-top: 80px; }

        .team-card {
            background: #fff;
            border-radius: 24px;
            padding: 30px;
            text-align: center;
            border: 1px solid #f1f5f9;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            height: 100%;
        }

        .team-card:hover {
            transform: translateY(-10px);
            border-color: var(--primary-blue);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.08);
        }

        .img-wrapper {
            width: 140px;
            height: 140px;
            margin: 0 auto 25px;
            position: relative;
        }

        .img-wrapper::after {
            content: '';
            position: absolute;
            inset: -8px;
            border: 2px dashed #e2e8f0;
            border-radius: 50%;
            transition: transform 0.6s ease;
        }

        .team-card:hover .img-wrapper::after {
            transform: rotate(90deg);
            border-color: var(--primary-blue);
        }

        .team-photo {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
            position: relative;
            z-index: 2;
        }

        .member-name {
            font-family: 'Outfit', sans-serif;
            font-weight: 700;
            font-size: 1.25rem;
            margin-bottom: 8px;
        }

        .member-role {
            color: var(--text-muted);
            font-size: 0.9rem;
            font-weight: 500;
        }

        /* --- DARK MODE --- */
        body.dark-mode { background-color: #0f172a; color: #f1f5f9; }
        body.dark-mode .about-hero { background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); }
        body.dark-mode .glass-section, body.dark-mode .team-card { 
            background: #1e293b; border-color: #334155; 
        }
        body.dark-mode h1, body.dark-mode .member-name { color: #fff; }
    </style>
</head>
<body class="<?= isset($_COOKIE['theme']) && $_COOKIE['theme'] === 'dark' ? 'dark-mode' : '' ?>">

<?php include 'includes/header.php'; ?>

<section class="about-hero">
    <div class="container">
        <span class="section-badge">Qui sommes-nous ?</span>
        <h1>JP-SERVICES</h1>
        <p class="lead text-muted mx-auto" style="max-width: 600px; text-align: justify;">
            L'excellence numérique à votre portée. Nous transformons vos idées en projets concrets et des projets en argent.
        </p>
    </div>
</section>

<div class="container py-5">
    <div class="row g-4">
        <div class="col-lg-6">
            <div class="glass-section h-100">
                <i class="fas fa-rocket text-primary fs-1 mb-3 d-block"></i>
                <h2 class="h3 fw-bold mb-4">Notre Mission</h2>
                <p class="text-muted lh-lg" style="text-align: justify;">
                    Notre objectif est de fournir des services web et des solutions technologiques de haute qualité, accessibles à tous. 
                    À Lubumbashi et partout ailleurs, nous croyons en l'innovation pour créer des outils qui facilitent la gestion quotidienne des entreprises.
                </p>
            </div>
        </div>

        <div class="col-lg-6">
            <div class="glass-section h-100">
                <i class="fas fa-shield-halved text-primary fs-1 mb-3 d-block"></i>
                <h2 class="h3 fw-bold mb-4">Nos Valeurs</h2>
                <p class="text-muted lh-lg" style="text-align: justify;">
                    <strong>Passion :</strong> Nous aimons ce que nous construisons.<br>
                    <strong>Intégrité :</strong> La transparence totale envers nos clients.<br>
                    <strong>Innovation :</strong> Nous ne suivons pas les tendances, nous les créons.
                </p>
            </div>
        </div>
    </div>

    <div class="team-grid">
        <div class="text-center mb-5">
            <h2 class="display-6 fw-bold">Les visages derrière le code</h2>
            <div class="mx-auto bg-primary rounded" style="width: 60px; height: 4px;"></div>
        </div>

        <div class="row g-4 justify-content-center">
            <?php if(!empty($membres)): ?>
                <?php foreach($membres as $m): ?>
                    <div class="col-md-6 col-lg-4">
                        <div class="team-card">
                            <div class="img-wrapper">
                                <?php 
                                    $photo_path = "admin/images/" . $m['photo'];
                                    // Affiche la photo si elle existe dans admin/images/, sinon affiche l'avatar par défaut à la racine
                                    if (empty($m['photo']) || !file_exists($photo_path)) {
                                        $image_src = "images/default-avatar.svg"; 
                                    } else {
                                        $image_src = $photo_path;
                                    }
                                ?>
                                <img src="<?= e($image_src) ?>" alt="<?= htmlspecialchars($m['nom']) ?>" class="team-photo">
                            </div>
                            <h3 class="member-name"><?= htmlspecialchars($m['nom']) ?></h3>
                            <p class="member-role"><?= htmlspecialchars($m['role']) ?></p>
                            
                           <div class="mt-3">
    <?php if(!empty($m['linkedin'])): ?>
        <a href="<?= htmlspecialchars($m['linkedin']) ?>" target="_blank" class="text-primary mx-2 shadow-sm">
            <i class="fab fa-linkedin-in" style="font-size: 1.2rem;"></i>
        </a>
    <?php endif; ?>

    <?php if(!empty($m['email'])): ?>
        <a href="mailto:<?= htmlspecialchars($m['email']) ?>" class="text-danger mx-2 shadow-sm">
            <i class="fas fa-envelope" style="font-size: 1.2rem;"></i>
        </a>
    <?php endif; ?>
</div>
                        </div>
                    </div>
                <?php endforeach; ?>
            <?php else: ?>
                <div class="col-12 text-center text-muted">
                    L'équipe se prépare, repassez bientôt !
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<?php include 'includes/footer.php'; ?>
</body>
</html>
