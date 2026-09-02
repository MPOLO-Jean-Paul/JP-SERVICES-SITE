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
use PHPMailer\PHPMailer\Exception;

$message_status = '';
$status_type = '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['reply_message'])) {
    $messageId = filter_input(INPUT_POST, 'message_id', FILTER_VALIDATE_INT);
    $replyText = trim((string)($_POST['reponse_texte'] ?? ''));
    if (!$messageId || mb_strlen($replyText, 'UTF-8') < 2 || mb_strlen($replyText, 'UTF-8') > 8000) {
        $message_status = 'Vérifiez le message sélectionné et la longueur de votre réponse.';
        $status_type = 'danger';
    } else {
        try {
            $original = $conn->prepare('SELECT nom, email, sujet FROM messages WHERE id = :id LIMIT 1');
            $original->execute(['id' => $messageId]);
            $recipient = $original->fetch(PDO::FETCH_ASSOC);
            if (!$recipient || !filter_var($recipient['email'], FILTER_VALIDATE_EMAIL)) {
                throw new RuntimeException('Destinataire introuvable ou invalide.');
            }
            $recipientName = trim((string)$recipient['nom']);
            $originalSubject = str_replace(["\r", "\n"], ' ', trim((string)$recipient['sujet']));
            $mail = jp_configure_mailer(new PHPMailer(true));
            $mail->addAddress((string)$recipient['email'], $recipientName);
            $mail->isHTML(true);
            $mail->Subject = 'Réponse à votre message : ' . $originalSubject;
            $mail->Body = '<div style="max-width:600px;margin:auto;font-family:Arial,sans-serif;color:#271a38"><h2>Bonjour ' . e($recipientName) . ',</h2><p>Nous avons traité votre demande concernant : <strong>' . e($originalSubject) . '</strong>.</p><div style="margin:24px 0;padding:18px;background:#f4f2ff;border-left:4px solid #7451eb">' . nl2br(e($replyText)) . '</div><p>Cordialement,<br><strong>L’équipe JP-SERVICES</strong></p></div>';
            $mail->AltBody = "Bonjour {$recipientName},\n\n{$replyText}\n\nCordialement,\nL'équipe JP-SERVICES";
            $mail->send();
            $message_status = "Réponse envoyée avec succès.";
            $status_type = "success";
        } catch (Throwable $exception) {
            error_log('Réponse message : ' . $exception->getMessage());
            $message_status = 'La réponse n’a pas pu être envoyée. Vérifiez la configuration e-mail.';
            $status_type = "danger";
        }
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_id'])) {
    $id = filter_input(INPUT_POST, 'delete_id', FILTER_VALIDATE_INT);
    if ($id) {
        $stmt = $conn->prepare("DELETE FROM messages WHERE id = ?");
        $stmt->execute([$id]);
        $message_status = "Message supprimé.";
        $status_type = "success";
    }
}

$messages = $conn->query("SELECT * FROM messages ORDER BY date_envoi DESC")->fetchAll(PDO::FETCH_ASSOC);
$page_title = "Boîte de réception";
include '../includes/header_admin.php';
?>

<style>
    :root { 
        --primary: #1a73e8; 
        --danger: #d93025; 
        --surface: #ffffff;
        --on-surface: #202124;
        --border: #dadce0;
        --bg: #f8f9fa;
    }
    body { background-color: var(--bg); font-family: 'Inter', sans-serif; color: var(--on-surface); }
    .g-font { font-family: 'Google Sans', sans-serif; }
    
    .main-card { 
        background: var(--surface); 
        border: 1px solid var(--border); 
        border-radius: 16px; 
        box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    
    .table thead th { 
        background: #f1f3f4; 
        text-transform: uppercase; 
        font-size: 11px; 
        letter-spacing: 0.8px; 
        font-weight: 700;
        color: #5f6368;
        padding: 16px;
        border: none;
    }
    
    .table tbody tr { transition: all 0.2s; border-bottom: 1px solid #f1f3f4; }
    .table tbody tr:hover { background-color: #f8f9fa; }
    
    .avatar-circle {
        width: 40px; height: 40px; 
        background: #e8f0fe; color: var(--primary);
        display: flex; align-items: center; justify-content: center;
        border-radius: 50%; font-weight: bold; font-size: 16px;
    }

    .msg-preview { 
        color: #5f6368; font-size: 13px; 
        display: block; max-width: 350px; 
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap; 
    }

    .btn-action {
        height: 38px; width: 38px;
        border-radius: 10px;
        display: inline-flex; align-items: center; justify-content: center;
        border: 1px solid var(--border);
        background: white; color: #5f6368;
        transition: 0.2s;
    }
    .btn-view:hover { color: var(--primary); border-color: var(--primary); background: #f4f8ff; }
    .btn-delete:hover { color: var(--danger); border-color: var(--danger); background: #fff5f4; }

    .modal-content { border-radius: 20px; border: none; }
    .reply-area { border-radius: 12px; padding: 12px; border: 1px solid var(--border); transition: 0.3s; }
    .reply-area:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(26,115,232,0.1); outline: none; }
</style>

<div class="container-fluid py-5 px-md-5">
    <div class="d-flex justify-content-between align-items-end mb-4">
        <div>
            <nav aria-label="breadcrumb">
                <ol class="breadcrumb mb-1">
                    <li class="breadcrumb-item small"><a href="index.php">Admin</a></li>
                    <li class="breadcrumb-item small active">Messages</li>
                </ol>
            </nav>
            <h1 class="h2 g-font fw-bold mb-0">Boîte de réception</h1>
        </div>
        <div class="text-end">
            <span class="badge bg-white text-dark border px-3 py-2 rounded-pill shadow-sm">
                <i class="fas fa-envelope text-primary me-2"></i><?= count($messages) ?> Messages au total
            </span>
        </div>
    </div>

    <?php if ($message_status): ?>
        <div class="alert alert-<?= e($status_type) ?> border-0 shadow-sm rounded-4 d-flex align-items-center mb-4">
            <i class="fas fa-check-circle me-3"></i> <?= e($message_status) ?>
            <button type="button" class="btn-close ms-auto" data-jp-dismiss="alert"></button>
        </div>
    <?php endif; ?>

    <div class="main-card overflow-hidden">
        <div class="table-responsive">
            <table class="table align-middle mb-0">
                <thead>
                    <tr>
                        <th class="ps-4">Expéditeur</th>
                        <th>Objet & Message</th>
                        <th>Réception</th>
                        <th class="text-end pe-4">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($messages as $m): 
                        $initiale = strtoupper(substr($m['nom'], 0, 1));
                    ?>
                    <tr>
                        <td class="ps-4">
                            <div class="d-flex align-items-center gap-3">
                                <div class="avatar-circle"><?= e($initiale) ?></div>
                                <div>
                                    <div class="fw-bold text-dark"><?= htmlspecialchars($m['nom']) ?></div>
                                    <div class="small text-muted"><?= htmlspecialchars($m['email']) ?></div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="fw-bold small text-primary mb-1"><?= htmlspecialchars($m['sujet']) ?></div>
                            <span class="msg-preview"><?= htmlspecialchars($m['message']) ?></span>
                        </td>
                        <td class="small text-muted">
                            <i class="far fa-clock me-1"></i> <?= date('d M, H:i', strtotime($m['date_envoi'])) ?>
                        </td>
                        <td class="text-end pe-4">
                            <div class="d-flex justify-content-end gap-2">
                                <button class="btn-action btn-view" data-jp-toggle="modal" data-jp-target="#replyModal<?= (int)$m['id'] ?>" title="Répondre">
                                    <i class="fas fa-reply-all fa-sm"></i>
                                </button>
                                <form method="POST" data-confirm="Supprimer définitivement ce message ?">
                                    <input type="hidden" name="delete_id" value="<?= (int)$m['id'] ?>">
                                    <button type="submit" class="btn-action btn-delete" title="Supprimer">
                                        <i class="fas fa-trash-alt fa-sm"></i>
                                    </button>
                                </form>
                            </div>
                        </td>
                    </tr>

                    <div class="modal fade" id="replyModal<?= (int)$m['id'] ?>" tabindex="-1" aria-hidden="true">
                        <div class="modal-dialog modal-dialog-centered">
                            <div class="modal-content shadow-lg">
                                <div class="modal-header border-0 pb-0">
                                    <h5 class="modal-title g-font fw-bold">Répondre à <?= htmlspecialchars($m['nom']) ?></h5>
                                    <button type="button" class="btn-close" data-jp-dismiss="modal"></button>
                                </div>
                                <form method="POST">
                                    <div class="modal-body p-4">
                                        <div class="p-3 rounded-4 bg-light mb-4 border-0">
                                            <div class="small fw-bold text-muted mb-1">MESSAGE REÇU :</div>
                                            <div class="small text-dark fst-italic">"<?= nl2br(htmlspecialchars($m['message'])) ?>"</div>
                                        </div>

                                        <input type="hidden" name="message_id" value="<?= (int)$m['id'] ?>">

                                        <div class="mb-2">
                                            <label class="form-label small fw-bold text-secondary">VOTRE RÉPONSE (EMAIL)</label>
                                            <textarea name="reponse_texte" class="reply-area w-100" rows="6" minlength="2" maxlength="8000" placeholder="Bonjour, ..." required></textarea>
                                        </div>
                                    </div>
                                    <div class="modal-footer border-0 p-4 pt-0">
                                        <button type="submit" name="reply_message" class="btn btn-primary w-100 py-3 rounded-pill fw-bold shadow-sm">
                                            <i class="fas fa-paper-plane me-2"></i>Envoyer la réponse
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <?php if (empty($messages)): ?>
                <div class="text-center py-5">
                    <i class="fas fa-inbox jp-empty-icon" aria-hidden="true"></i>
                    <p class="text-muted">Aucun message pour le moment.</p>
                </div>
            <?php endif; ?>
        </div>
    </div>
</div>
<?php include '../includes/footer_admin.php'; ?>
