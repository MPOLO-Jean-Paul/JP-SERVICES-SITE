<?php

declare(strict_types=1);

/** Thèmes proposés aux abonnés de la newsletter (clé => libellé). */
function jp_newsletter_themes(): array
{
    return [
        'formations' => 'Formations',
        'formations_en_ligne' => 'Formations en ligne',
        'logiciels' => 'Logiciels',
        'actualites' => 'Actualités',
        'offres' => 'Offres & promotions',
    ];
}

/** Jeton signé (HMAC) permettant de gérer ses préférences sans compte. */
function jp_newsletter_token(string $email): string
{
    $secret = (string)env('APP_KEY', hash('sha256', JP_ROOT));
    return substr(hash_hmac('sha256', 'newsletter:' . strtolower(trim($email)), $secret), 0, 40);
}

/** URL absolue de la page de gestion des préférences pour un abonné. */
function jp_newsletter_prefs_url(string $email): string
{
    $email = strtolower(trim($email));
    return absolute_url('/newsletter/preferences') . '?email=' . rawurlencode($email) . '&t=' . jp_newsletter_token($email);
}
