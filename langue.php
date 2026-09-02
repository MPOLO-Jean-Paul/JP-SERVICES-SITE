<?php

declare(strict_types=1);

require_once __DIR__ . '/app/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jp_abort(405, jp_tr('Méthode non autorisée.', 'Method not allowed.'));
}

$locale = strtolower(trim((string)($_POST['locale'] ?? '')));
if (!array_key_exists($locale, jp_supported_locales())) {
    jp_abort(422, jp_tr('Langue non prise en charge.', 'Unsupported language.'));
}

$_SESSION['jp_locale'] = $locale;
$secure = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
setcookie('jp_locale', $locale, [
    'expires' => time() + 31536000,
    'path' => jp_base_path() ?: '/',
    'domain' => '',
    'secure' => $secure,
    'httponly' => true,
    'samesite' => 'Lax',
]);

header('Vary: Cookie', false);
header('Cache-Control: no-store, private');
header('Location: ' . jp_locale_return_path($_POST['return_to'] ?? null), true, 303);
exit;
