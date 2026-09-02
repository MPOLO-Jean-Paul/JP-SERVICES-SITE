<?php

declare(strict_types=1);

require_once JP_ROOT . '/includes/PHPMailer/Exception.php';
require_once JP_ROOT . '/includes/PHPMailer/PHPMailer.php';
require_once JP_ROOT . '/includes/PHPMailer/SMTP.php';
require_once JP_ROOT . '/app/mailer.php';

function jp_auth_mailer(): \PHPMailer\PHPMailer\PHPMailer
{
    return jp_configure_mailer(new \PHPMailer\PHPMailer\PHPMailer(true));
}

function jp_send_activation_email(string $email, string $prenom, string $token): void
{
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/^\d{6}$/', $token) !== 1) {
        throw new InvalidArgumentException('Destinataire ou code d’activation invalide.');
    }

    $activationUrl = absolute_url('/activation');
    $safePrenom = e($prenom !== '' ? $prenom : '');
    $greeting = $safePrenom !== '' ? 'Bonjour ' . $safePrenom . ',' : 'Bonjour,';
    $safeUrl = e($activationUrl);
    $mail = jp_auth_mailer();
    $mail->addAddress($email, $prenom !== '' ? mb_substr($prenom, 0, 100, 'UTF-8') : '');
    $mail->isHTML(true);
    $mail->Subject = 'Activez votre compte JP-Services';
    $safeCode = e($token);
    $mail->Body = "<div style='max-width:600px;margin:auto;font-family:Arial,sans-serif;color:#0B1526'><img src='" . e(absolute_url('/images/logo2.png')) . "' width='80' alt='JP-Services'><h2>{$greeting}</h2><p>Confirmez votre inscription à JP-Services avec ce code d’activation :</p><p style='margin:18px 0 30px;font-size:30px;letter-spacing:8px;font-weight:800;color:#1F72F1'>{$safeCode}</p><p style='margin:30px 0'><a href='{$safeUrl}' style='background:#1F72F1;color:#fff;padding:14px 22px;border-radius:8px;text-decoration:none;font-weight:bold'>Ouvrir la page d’activation</a></p><p style='color:#6B7385'>Ce code est valable 15 minutes et ne peut être utilisé qu’une fois. Si vous n’êtes pas à l’origine de cette inscription, ignorez cet e-mail.</p></div>";
    $mail->AltBody = "Code d’activation JP-Services : {$token}\n\nOuvrez {$activationUrl} puis saisissez ce code. Il est valable 15 minutes.";
    $mail->send();
}

function jp_send_password_reset_email(string $email, string $prenom, string $token): void
{
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || preg_match('/^\d{6}$/', $token) !== 1) {
        throw new InvalidArgumentException('Destinataire ou code de réinitialisation invalide.');
    }

    $resetUrl = absolute_url('/mot-de-passe/reinitialiser');
    $safePrenom = e($prenom !== '' ? $prenom : '');
    $greeting = $safePrenom !== '' ? 'Bonjour ' . $safePrenom . ',' : 'Bonjour,';
    $safeUrl = e($resetUrl);
    $mail = jp_auth_mailer();
    $mail->addAddress($email, $prenom !== '' ? mb_substr($prenom, 0, 100, 'UTF-8') : '');
    $mail->isHTML(true);
    $mail->Subject = 'Réinitialisation de votre mot de passe JP-Services';
    $safeCode = e($token);
    $mail->Body = "<div style='max-width:600px;margin:auto;font-family:Arial,sans-serif;color:#0B1526'><img src='" . e(absolute_url('/images/logo2.png')) . "' width='80' alt='JP-Services'><h2>{$greeting}</h2><p>Une demande de réinitialisation de mot de passe a été reçue.</p><p style='margin:22px 0 10px'>Saisissez ce code dans la page sécurisée :</p><p style='margin:0 0 30px;font-size:30px;letter-spacing:8px;font-weight:800;color:#1F72F1'>{$safeCode}</p><p style='margin:30px 0'><a href='{$safeUrl}' style='background:#1F72F1;color:#fff;padding:14px 22px;border-radius:8px;text-decoration:none;font-weight:bold'>Ouvrir la page sécurisée</a></p><p style='color:#6B7385'>Ce code est valable une minute et ne peut être utilisé qu’une fois. Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail.</p></div>";
    $mail->AltBody = "Code de réinitialisation JP-Services : {$token}\n\nOuvrez {$resetUrl} puis saisissez ce code. Il est valable une minute et ne peut être utilisé qu’une fois.";
    $mail->send();
}
