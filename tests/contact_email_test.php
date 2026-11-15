<?php

declare(strict_types=1);

// Test autonome sans base MySQL ni configuration SMTP.
function env(string $key, mixed $default = null): mixed
{
    $value = getenv($key);
    return $value === false ? $default : $value;
}

require_once dirname(__DIR__) . '/app/site_settings.php';

$cases = [
    ['support@example.org', 'support@example.org'],
    ['invalid-email', 'contact@jp-services.com'],
    ["personne@example.org\r\nBcc:tiers@example.org", 'contact@jp-services.com'],
    ['', 'contact@jp-services.com'],
];

foreach ($cases as [$configured, $expected]) {
    putenv('CONTACT_EMAIL=' . $configured);
    $actual = jp_contact_email();
    if ($actual !== $expected) {
        fwrite(STDERR, "Échec du test contact : valeur inattendue.\n");
        exit(1);
    }
}

putenv('CONTACT_EMAIL');
if (jp_contact_email() !== 'contact@jp-services.com') {
    fwrite(STDERR, "Échec du test du repli par défaut.\n");
    exit(1);
}

echo "OK : validation et repli de l'adresse publique.\n";

$phones = [
    ['+243 (977) 152-825', true, '+243977152825'],
    ['0977152825', true, '0977152825'],
    ["+243 977 152 825\r\nBcc:spam", false, ''],
    ['tel:+243977152825', false, ''],
    ['1234', false, ''],
];
foreach ($phones as [$number, $valid, $uri]) {
    if (jp_valid_public_phone($number) !== $valid) {
        fwrite(STDERR, "Échec validation du numéro public.\n");
        exit(1);
    }
    if ($valid && jp_phone_tel_uri($number) !== $uri) {
        fwrite(STDERR, "Échec génération du lien téléphonique.\n");
        exit(1);
    }
}

$whatsapp = [
    ['+243 860 951 131', '243860951131'],
    ['243860951131', '243860951131'],
    ['textejavascript', null],
    ['003', null],
    ["243860951131\r\nCc:spam", null],
];
foreach ($whatsapp as [$number, $expected]) {
    if (jp_normalize_whatsapp($number) !== $expected) {
        fwrite(STDERR, "Échec normalisation du numéro WhatsApp.\n");
        exit(1);
    }
}

putenv('CONTACT_PHONE=+243 (977) 152-825');
if (jp_contact_phone() !== '+243 (977) 152-825') {
    fwrite(STDERR, "Échec lecture CONTACT_PHONE.\n");
    exit(1);
}
putenv('CONTACT_PHONE');

putenv('CONTACT_WHATSAPP=+243 860 951 131');
if (jp_contact_whatsapp() !== '243860951131') {
    fwrite(STDERR, "Échec lecture CONTACT_WHATSAPP.\n");
    exit(1);
}
putenv('CONTACT_WHATSAPP');
