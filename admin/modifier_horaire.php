<?php
require_once dirname(__DIR__) . '/app/bootstrap.php';
require_admin();
require_once '../includes/connexion_db.php';

// Importation de PHPMailer
require '../includes/PHPMailer/Exception.php';
require '../includes/PHPMailer/PHPMailer.php';
require '../includes/PHPMailer/SMTP.php';
require_once dirname(__DIR__) . '/app/mailer.php';

use PHPMailer\PHPMailer\PHPMailer;

$id = isset($_GET['id']) ? intval($_GET['id']) : 0;
$message_status = "";
$planning = null;

try {
    $stmt = $conn->prepare("SELECT p.*, u.nom, u.prenom, u.email, u.photo_profil, f.titre 
                            FROM planning_valide p 
                            JOIN users u ON p.user_id = u.id 
                            JOIN formations f ON p.formation_id = f.id 
                            WHERE p.id = ?");
    $stmt->execute([$id]);
    $planning = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$planning) {
        $message_status = "<div class='alert alert-danger rounded-4 shadow-sm'>Erreur : Planning introuvable.</div>";
    } else {
        if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['update_planning'])) {
            $modules = trim($_POST['modules_choisis']);
            $horaire_json = trim($_POST['horaire_json']);

            if (json_decode($horaire_json) === null) {
                $message_status = "<div class='alert alert-warning rounded-4 shadow-sm'>Format JSON invalide.</div>";
            } else {
                // 1. Mise à jour SQL
                $update = $conn->prepare("UPDATE planning_valide SET modules_choisis = ?, horaire_details = ?, statut = 'valide', date_validation = NOW() WHERE id = ?");
                $update->execute([$modules, $horaire_json, $id]);

                // 2. Envoi du Mail Professionnel
                try {
                    $mail = jp_configure_mailer(new PHPMailer(true));
                    $mail->addAddress($planning['email'], $planning['prenom']);

                    // Construction du tableau d'horaire pour le mail
                    $horaires_array = json_decode($horaire_json, true);
                    $table_rows = "";
                    foreach($horaires_array as $jour => $t) {
                        $safeDay = e((string)$jour);
                        $safeStart = e((string)($t['debut'] ?? ''));
                        $safeEnd = e((string)($t['fin'] ?? ''));
                        $table_rows .= "
                        <tr>
                            <td style='padding: 12px; border-bottom: 1px solid #eee; font-weight: bold; color: #1a73e8;'>{$safeDay}</td>
                            <td style='padding: 12px; border-bottom: 1px solid #eee; color: #444;'>{$safeStart} à {$safeEnd}</td>
                        </tr>";
                    }

                    $safePrenom = e((string)$planning['prenom']);
                    $safeTitre = e((string)$planning['titre']);
                    $safeModules = nl2br(e($modules));

                    // --- CORPS DU MAIL ---
                    $mail->isHTML(true);
                    $mail->Subject = "✅ Validation de votre horaire : " . $planning['titre'];
                    $mail->Body    = "
                    <div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden;'>
                        <div style='background-color: #1a73e8; padding: 20px; text-align: center;'>
                            <h1 style='color: #ffffff; margin: 0; font-size: 20px;'>Confirmation d'Horaire</h1>
                        </div>
                        <div style='padding: 25px;'>
                            <p style='font-size: 16px;'>Bonjour <strong>{$safePrenom}</strong>,</p>
                            <p>Nous avons le plaisir de vous informer que votre planning pour la formation <strong>{$safeTitre}</strong> a été officiellement validé.</p>
                            
                            <h3 style='color: #1a73e8; border-bottom: 2px solid #f1f1f1; padding-bottom: 8px; margin-top: 25px;'>🗓 Votre Emploi du Temps :</h3>
                            <table style='width: 100%; border-collapse: collapse; margin-top: 10px;'>
                                $table_rows
                            </table>

                            <div style='margin-top: 25px; padding: 15px; background-color: #f8faff; border-radius: 8px; border-left: 4px solid #1a73e8;'>
                                <p style='margin: 0; font-weight: bold; color: #1a73e8;'>Modules retenus :</p>
                                <p style='margin: 5px 0 0 0; color: #555; font-size: 14px;'>{$safeModules}</p>
                            </div>

                            <p style='margin-top: 30px; font-size: 14px; color: #666;'>
                                Nous vous souhaitons une excellente session de formation.<br><br>
                                Cordialement,<br>
                                <strong>L'équipe JP-SERVICES</strong>
                            </p>
                        </div>
                    </div>";

                    $mail->send();
                    redirect('/admin/horaires?msg=updated');
                } catch (Throwable $e) {
                    error_log('Validation planning e-mail: ' . $e->getMessage());
                    $message_status = "<div class='alert alert-warning rounded-4 shadow-sm'>Le planning a été validé, mais l’e-mail n’a pas pu être envoyé.</div>";
                }
            }
        }
    }
} catch (PDOException $e) {
    $message_status = "<div class='alert alert-danger rounded-4 shadow-sm'>Erreur base de données.</div>";
}
?>
<?php
$page_title = 'Validation du planning';
include '../includes/header_admin.php';
?>
<style>
        :root { --primary-color: #1a73e8; }
        body { background: #f8faff; font-family: 'Plus Jakarta Sans', sans-serif; }
        .wrapper { min-height: 80vh; padding: 40px 0; }
        .main-card { border: none; border-radius: 24px; box-shadow: 0 10px 40px rgba(0,0,0,0.03); background: white; overflow: hidden; }
        .user-banner { background: #f1f5f9; padding: 25px; border-bottom: 1px solid #e2e8f0; }
        .avatar-box { width: 70px; height: 70px; border-radius: 18px; object-fit: cover; border: 3px solid white; }
        .form-label { font-weight: 700; font-size: 0.8rem; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; }
        .json-editor { 
            font-family: 'Consolas', monospace; background: #1e1e1e !important; color: #d4d4d4 !important; 
            border-radius: 12px; font-size: 0.85rem; padding: 15px; border: none;
        }
        .btn-confirm { background: var(--primary-color); border-radius: 12px; padding: 12px; font-weight: 700; transition: 0.3s; border: none; }
        .btn-confirm:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(26, 115, 232, 0.2); background: #1557b0; }
    </style>
<div class="wrapper">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-7">
                
                <div class="main-card shadow-sm">
                    <?php if ($planning): ?>
                    <div class="user-banner d-flex align-items-center gap-3">
                        <img src="<?= e(url('/' . ltrim((string)($planning['photo_profil'] ?: 'images/default-avatar.svg'), '/'))) ?>" class="avatar-box shadow-sm" alt="Photo de profil">
                        <div>
                            <h5 class="fw-bold mb-0"><?= htmlspecialchars($planning['prenom'].' '.$planning['nom']) ?></h5>
                            <span class="badge bg-white text-primary border rounded-pill"><?= e($planning['email']) ?></span>
                        </div>
                    </div>

                    <div class="p-4 p-md-5">
                        <?= e($message_status) ?>
                        
                        <form method="POST">
                            <?= csrf_field() ?>
                            <div class="mb-4">
                                <label class="form-label">Formation Sélectionnée</label>
                                <div class="p-3 rounded-3 bg-light border-start border-4 border-primary">
                                    <i class="fas fa-book-open me-2 text-primary"></i> <strong><?= htmlspecialchars($planning['titre']) ?></strong>
                                </div>
                            </div>

                            <div class="mb-4">
                                <label class="form-label">Modules à inscrire dans le mail</label>
                                <input type="text" name="modules_choisis" class="form-control form-control-lg border-2 shadow-none" 
                                       value="<?= htmlspecialchars($planning['modules_choisis']) ?>" required 
                                       style="border-radius: 12px; font-size: 0.95rem;">
                            </div>

                            <div class="mb-4">
                                <label class="form-label d-flex justify-content-between">
                                    Détails des créneaux (JSON)
                                    <small class="text-lowercase text-muted">Format: {"Lundi":{"debut":"08:00","fin":"10:00"}}</small>
                                </label>
                                <textarea name="horaire_json" class="form-control json-editor shadow-none" rows="6" required><?= htmlspecialchars($planning['horaire_details']) ?></textarea>
                            </div>

                            <div class="row g-3">
                                <div class="col-md-4">
                                    <a href="gestion_horaire.php" class="btn btn-outline-secondary w-100 py-2 fw-bold shadow-none" style="border-radius:12px;">Retour</a>
                                </div>
                                <div class="col-md-8">
                                    <button type="submit" name="update_planning" class="btn btn-primary btn-confirm w-100 text-white shadow-none">
                                        <i class="fas fa-check-circle me-2"></i> Valider & Envoyer Notification
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                    <?php else: ?>
                        <div class="p-5 text-center">
                            <i class="fas fa-search-minus fa-3x text-light mb-3"></i>
                            <p>Aucune donnée trouvée.</p>
                            <a href="gestion_horaire.php" class="btn btn-primary rounded-pill px-4">Retour à la liste</a>
                        </div>
                    <?php endif; ?>
                </div>

            </div>
        </div>
    </div>
</div>
<?php include '../includes/footer_admin.php'; ?>
