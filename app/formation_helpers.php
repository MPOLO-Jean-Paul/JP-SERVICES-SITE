<?php

declare(strict_types=1);

function jp_formation_modules(?string $value): array
{
    $items = preg_split('/\s*(?:\r\n|\r|\n|,|;)\s*/u', trim((string)$value)) ?: [];
    $items = array_values(array_unique(array_filter(array_map(
        static fn (string $item): string => trim($item),
        $items
    ), static fn (string $item): bool => $item !== '')));

    return array_slice($items, 0, 30);
}

function jp_formation_domain(array $formation): array
{
    $content = mb_strtolower(trim((string)($formation['titre'] ?? '') . ' ' . (string)($formation['description'] ?? '')), 'UTF-8');
    $normalized = strtr($content, [
        'à' => 'a', 'â' => 'a', 'ä' => 'a', 'á' => 'a',
        'ç' => 'c', 'é' => 'e', 'è' => 'e', 'ê' => 'e', 'ë' => 'e',
        'î' => 'i', 'ï' => 'i', 'ô' => 'o', 'ö' => 'o',
        'ù' => 'u', 'û' => 'u', 'ü' => 'u',
    ]);

    $domains = [
        ['developpement', jp_tr('Développement web', 'Web development'), 'fa-code', ['developpement', 'programmation', 'javascript', 'html', 'css', 'php', 'wordpress', 'web']],
        ['data-numerique', jp_tr('Data & numérique', 'Data & digital'), 'fa-chart-line', ['data', 'sql', 'base de donnees', 'analyse de donnees', 'informatique', 'numerique', 'reseau']],
        ['marketing-communication', 'Marketing & communication', 'fa-bullhorn', ['marketing', 'communication', 'reseaux sociaux', 'community', 'graphisme', 'design', 'canva']],
        ['bureautique-gestion', jp_tr('Bureautique & gestion', 'Office tools & management'), 'fa-table-cells', ['excel', 'word', 'powerpoint', 'office', 'bureautique', 'comptabilite', 'gestion']],
        ['management-entrepreneuriat', jp_tr('Management & entrepreneuriat', 'Management & entrepreneurship'), 'fa-briefcase', ['management', 'entrepreneuriat', 'leadership', 'gestion de projet', 'entreprise']],
    ];

    foreach ($domains as [$slug, $label, $icon, $keywords]) {
        foreach ($keywords as $keyword) {
            if (str_contains($normalized, $keyword)) {
                return ['slug' => $slug, 'label' => $label, 'icon' => $icon];
            }
        }
    }

    return ['slug' => 'competences-pro', 'label' => jp_tr('Compétences professionnelles', 'Professional skills'), 'icon' => 'fa-layer-group'];
}

function jp_formation_excerpt(?string $value, int $length = 155): string
{
    $plain = trim(preg_replace('/\s+/u', ' ', strip_tags((string)$value)) ?? '');
    if ($plain === '') {
        return jp_tr('Un parcours structuré pour développer une compétence directement applicable.', 'A structured path to develop a skill you can apply directly.');
    }
    if (mb_strlen($plain, 'UTF-8') <= $length) {
        return $plain;
    }
    return rtrim(mb_substr($plain, 0, $length - 1, 'UTF-8'), " \t\n\r\0\x0B,.;:") . '…';
}

function jp_formation_price_label(mixed $value): string
{
    $price = max(0, (float)$value);
    if ($price <= 0) {
        return jp_tr('Gratuit', 'Free');
    }
    $decimals = floor($price) === $price ? 0 : 2;
    return number_format($price, $decimals, ',', ' ') . ' USD';
}

function jp_formation_date_label(mixed $value): string
{
    $raw = substr(trim((string)$value), 0, 10);
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $raw);
    $errors = DateTimeImmutable::getLastErrors();
    if (!$date || (is_array($errors) && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))) {
        return jp_tr('Date communiquée après inscription', 'Date confirmed after enrolment');
    }

    $months = jp_is_english()
        ? [1 => 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
        : [1 => 'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return (int)$date->format('j') . ' ' . $months[(int)$date->format('n')] . ' ' . $date->format('Y');
}

function jp_formation_image(mixed $value): string
{
    $relative = ltrim(str_replace('\\', '/', trim((string)$value)), '/');
    if ($relative === '' || str_contains($relative, '..') || !preg_match('~^(?:images|uploads)/[a-z0-9_./-]+$~i', $relative)) {
        $relative = 'images/formations/default.jpg';
    }
    return url('/' . $relative);
}
