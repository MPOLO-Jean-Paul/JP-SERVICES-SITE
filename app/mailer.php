<?php

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

/**
 * Retourne une erreur de configuration sans jamais inclure de secret SMTP.
 */
function jp_smtp_configuration_error(): ?string
{
    $host = trim((string)env('SMTP_HOST', ''));
    $username = trim((string)env('SMTP_USERNAME', ''));
    $password = (string)env('SMTP_PASSWORD', '');
    $from = trim((string)env('SMTP_FROM_ADDRESS', $username));
    $encryption = strtolower(trim((string)env('SMTP_ENCRYPTION', 'tls')));
    $port = filter_var(env('SMTP_PORT', $encryption === 'ssl' ? 465 : 587), FILTER_VALIDATE_INT);

    if ($host === '' || preg_match('/^[A-Za-z0-9.-]+$/', $host) !== 1) {
        return 'Hôte SMTP absent ou invalide.';
    }
    if ($username === '' || $password === '') {
        return 'Identifiants SMTP absents.';
    }
    if (!filter_var($from, FILTER_VALIDATE_EMAIL)) {
        return 'Adresse expéditrice SMTP invalide.';
    }
    if ($port === false || $port < 1 || $port > 65535) {
        return 'Port SMTP invalide.';
    }
    if (!in_array($encryption, ['tls', 'ssl', 'none'], true)) {
        return 'Chiffrement SMTP invalide.';
    }
    if ((string)env('APP_ENV', 'production') === 'production' && $encryption === 'none') {
        return 'Le chiffrement SMTP est requis en production.';
    }

    return null;
}

function jp_smtp_is_configured(): bool
{
    return jp_smtp_configuration_error() === null;
}

function jp_configure_mailer(PHPMailer $mail): PHPMailer
{
    $configurationError = jp_smtp_configuration_error();
    if ($configurationError !== null) {
        throw new RuntimeException('Configuration SMTP indisponible.');
    }

    $encryption = strtolower(trim((string)env('SMTP_ENCRYPTION', 'tls')));
    $username = trim((string)env('SMTP_USERNAME', ''));
    $fromAddress = trim((string)env('SMTP_FROM_ADDRESS', $username));
    $fromName = trim((string)env('SMTP_FROM_NAME', 'JP-Services'));
    $timeout = filter_var(env('SMTP_TIMEOUT', 15), FILTER_VALIDATE_INT);

    $mail->isSMTP();
    $mail->Host = trim((string)env('SMTP_HOST', ''));
    $mail->SMTPAuth = true;
    $mail->Username = $username;
    $mail->Password = (string)env('SMTP_PASSWORD', '');
    $mail->Port = (int)env('SMTP_PORT', $encryption === 'ssl' ? 465 : 587);
    $mail->SMTPSecure = match ($encryption) {
        'ssl' => PHPMailer::ENCRYPTION_SMTPS,
        'tls' => PHPMailer::ENCRYPTION_STARTTLS,
        default => '',
    };
    $mail->SMTPAutoTLS = $encryption === 'tls';
    $mail->SMTPDebug = 0;
    $mail->Timeout = max(5, min((int)($timeout === false ? 15 : $timeout), 30));
    $mail->CharSet = PHPMailer::CHARSET_UTF8;
    $mail->Encoding = PHPMailer::ENCODING_QUOTED_PRINTABLE;
    $mail->SMTPOptions = [
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
            'allow_self_signed' => false,
        ],
    ];
    $mail->setFrom($fromAddress, $fromName !== '' ? mb_substr($fromName, 0, 100, 'UTF-8') : 'JP-Services');

    $replyTo = trim((string)env('SMTP_REPLY_TO', ''));
    if ($replyTo !== '' && filter_var($replyTo, FILTER_VALIDATE_EMAIL)) {
        $mail->addReplyTo($replyTo);
    }

    return $mail;
}
