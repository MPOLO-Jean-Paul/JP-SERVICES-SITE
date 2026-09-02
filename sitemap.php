<?php

declare(strict_types=1);
require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/includes/connexion_db.php';

// Nettoie les buffers de bootstrap (jp_html_transform) pour renvoyer du XML pur
while (ob_get_level() > 0) { @ob_end_clean(); }

if (!headers_sent()) {
    header('Content-Type: application/xml; charset=utf-8');
    header('Cache-Control: public, max-age=3600');
}

$baseUrl = rtrim(absolute_url('/'), '/');
$today = date('Y-m-d');

/** @var array<int, array{loc:string, lastmod?:string, changefreq?:string, priority?:string}> */
$urls = [
    ['loc' => $baseUrl . '/',                     'lastmod' => $today, 'changefreq' => 'daily',   'priority' => '1.0'],
    ['loc' => $baseUrl . '/formations',           'lastmod' => $today, 'changefreq' => 'weekly',  'priority' => '0.9'],
    ['loc' => $baseUrl . '/formations-en-ligne',  'lastmod' => $today, 'changefreq' => 'daily',   'priority' => '0.9'],
    ['loc' => $baseUrl . '/ad/solution-digitale-tout-en-un.html', 'lastmod' => $today, 'changefreq' => 'weekly', 'priority' => '0.8'],
    ['loc' => $baseUrl . '/logiciels',            'lastmod' => $today, 'changefreq' => 'weekly',  'priority' => '0.8'],
    ['loc' => $baseUrl . '/projets',              'lastmod' => $today, 'changefreq' => 'weekly',  'priority' => '0.7'],
    ['loc' => $baseUrl . '/actualites',           'lastmod' => $today, 'changefreq' => 'daily',   'priority' => '0.8'],
    ['loc' => $baseUrl . '/forum',                'lastmod' => $today, 'changefreq' => 'daily',   'priority' => '0.7'],
    ['loc' => $baseUrl . '/partenariat',          'lastmod' => $today, 'changefreq' => 'monthly', 'priority' => '0.6'],
    ['loc' => $baseUrl . '/a-propos',             'lastmod' => $today, 'changefreq' => 'monthly', 'priority' => '0.5'],
    ['loc' => $baseUrl . '/contact',              'lastmod' => $today, 'changefreq' => 'monthly', 'priority' => '0.6'],
    ['loc' => $baseUrl . '/aide',                 'lastmod' => $today, 'changefreq' => 'monthly', 'priority' => '0.5'],
    ['loc' => $baseUrl . '/conditions',           'changefreq' => 'yearly',  'priority' => '0.3'],
    ['loc' => $baseUrl . '/confidentialite',      'changefreq' => 'yearly',  'priority' => '0.3'],
    ['loc' => $baseUrl . '/cookies',              'changefreq' => 'yearly',  'priority' => '0.3'],
];

$dynamic = [];
if (isset($conn) && $conn instanceof PDO) {
    try {
        foreach ($conn->query('SELECT id, date_creation FROM formations ORDER BY date_creation DESC LIMIT 500') as $row) {
            $dynamic[] = [
                'loc' => $baseUrl . '/formation?id=' . (int)$row['id'],
                'lastmod' => substr((string)($row['date_creation'] ?? ''), 0, 10) ?: $today,
                'changefreq' => 'weekly',
                'priority' => '0.7',
            ];
        }
    } catch (Throwable $exception) {
        error_log('Sitemap formations: ' . $exception->getMessage());
    }
    try {
        foreach ($conn->query('SELECT id, date_publication FROM actualites ORDER BY date_publication DESC LIMIT 500') as $row) {
            $dynamic[] = [
                'loc' => $baseUrl . '/actualite?id=' . (int)$row['id'],
                'lastmod' => substr((string)($row['date_publication'] ?? ''), 0, 10) ?: $today,
                'changefreq' => 'monthly',
                'priority' => '0.6',
            ];
        }
    } catch (Throwable $exception) {
        error_log('Sitemap actualites: ' . $exception->getMessage());
    }
    try {
        foreach ($conn->query("SELECT id, mis_a_jour FROM logiciels WHERE statut = 'publie' ORDER BY mis_a_jour DESC LIMIT 500") as $row) {
            $dynamic[] = [
                'loc' => $baseUrl . '/telecharger?id=' . (int)$row['id'],
                'lastmod' => substr((string)($row['mis_a_jour'] ?? ''), 0, 10) ?: $today,
                'changefreq' => 'monthly',
                'priority' => '0.5',
            ];
        }
    } catch (Throwable $exception) {
        error_log('Sitemap logiciels: ' . $exception->getMessage());
    }
    try {
        foreach ($conn->query("SELECT id, date_debut FROM live_sessions WHERE statut IN ('planifiee','en_cours') ORDER BY date_debut ASC LIMIT 200") as $row) {
            $dynamic[] = [
                'loc' => $baseUrl . '/visio?id=' . (int)$row['id'],
                'lastmod' => substr((string)($row['date_debut'] ?? ''), 0, 10) ?: $today,
                'changefreq' => 'daily',
                'priority' => '0.6',
            ];
        }
    } catch (Throwable $exception) {
        error_log('Sitemap live: ' . $exception->getMessage());
    }
}

$urls = array_merge($urls, $dynamic);

echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' . "\n";
foreach ($urls as $item) {
    echo '  <url>' . "\n";
    echo '    <loc>' . htmlspecialchars($item['loc'], ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</loc>' . "\n";
    if (!empty($item['lastmod'])) echo '    <lastmod>' . htmlspecialchars($item['lastmod'], ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</lastmod>' . "\n";
    if (!empty($item['changefreq'])) echo '    <changefreq>' . htmlspecialchars($item['changefreq'], ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</changefreq>' . "\n";
    if (!empty($item['priority'])) echo '    <priority>' . htmlspecialchars($item['priority'], ENT_XML1 | ENT_QUOTES, 'UTF-8') . '</priority>' . "\n";
    echo '  </url>' . "\n";
}
echo '</urlset>' . "\n";
