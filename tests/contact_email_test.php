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
