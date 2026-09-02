<?php

declare(strict_types=1);

if (defined('JP_BOOTSTRAPPED')) {
    return;
}
define('JP_BOOTSTRAPPED', true);

define('JP_ROOT', dirname(__DIR__));

define('JP_ROUTES', require JP_ROOT . '/app/routes.php');

// Some shared hosting plans do not enable mbstring. These focused UTF-8
// fallbacks prevent public pages and validation rules from failing with a 500.
if (!function_exists('mb_strlen')) {
    function mb_strlen(string $string, ?string $encoding = null): int
    {
        $count = preg_match_all('/./us', $string, $matches);
        return $count === false ? strlen($string) : $count;
    }
}

if (!function_exists('mb_substr')) {
    function mb_substr(string $string, int $start, ?int $length = null, ?string $encoding = null): string
    {
        $characters = preg_split('//u', $string, -1, PREG_SPLIT_NO_EMPTY);
        if (!is_array($characters)) {
            return $length === null ? substr($string, $start) : substr($string, $start, $length);
        }
        return implode('', array_slice($characters, $start, $length));
    }
}

if (!function_exists('mb_strtolower')) {
    function mb_strtolower(string $string, ?string $encoding = null): string
    {
        return strtolower(strtr($string, ['À'=>'à','Â'=>'â','Ä'=>'ä','Ç'=>'ç','É'=>'é','È'=>'è','Ê'=>'ê','Ë'=>'ë','Î'=>'î','Ï'=>'ï','Ô'=>'ô','Ö'=>'ö','Ù'=>'ù','Û'=>'û','Ü'=>'ü','Ÿ'=>'ÿ','Œ'=>'œ']));
    }
}

if (!function_exists('mb_strtoupper')) {
    function mb_strtoupper(string $string, ?string $encoding = null): string
    {
        return strtoupper(strtr($string, ['à'=>'À','â'=>'Â','ä'=>'Ä','ç'=>'Ç','é'=>'É','è'=>'È','ê'=>'Ê','ë'=>'Ë','î'=>'Î','ï'=>'Ï','ô'=>'Ô','ö'=>'Ö','ù'=>'Ù','û'=>'Û','ü'=>'Ü','ÿ'=>'Ÿ','œ'=>'Œ']));
    }
}

if (!function_exists('mb_strimwidth')) {
    function mb_strimwidth(string $string, int $start, int $width, string $trimMarker = '', ?string $encoding = null): string
    {
        $slice = mb_substr($string, $start, null, $encoding);
        if (mb_strlen($slice, $encoding) <= $width) {
            return $slice;
        }
        $usable = max(0, $width - mb_strlen($trimMarker, $encoding));
        return mb_substr($slice, 0, $usable, $encoding) . $trimMarker;
    }
}

function jp_load_env(string $file, bool $override = false): void
{
    if (!is_file($file) || !is_readable($file)) {
        return;
    }

    foreach (file($file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }
        [$key, $value] = array_map('trim', explode('=', $line, 2));
        if ($key === '' || (!$override && getenv($key) !== false)) {
            continue;
        }
        if ((str_starts_with($value, '"') && str_ends_with($value, '"')) || (str_starts_with($value, "'") && str_ends_with($value, "'"))) {
            $value = substr($value, 1, -1);
        }
        putenv($key . '=' . $value);
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

jp_load_env(JP_ROOT . '/.env');
// Cette surcharge n'est utilisée qu'en développement local (Laragon, CI, etc.).
// Elle reste ignorée par Git et n'écrase jamais la configuration de production.
jp_load_env(JP_ROOT . '/.env.local', true);

function env(string $key, mixed $default = null): mixed
{
    $value = getenv($key);
    if ($value === false) {
        return $default;
    }
    $normalized = strtolower(trim((string)$value));
    return match ($normalized) {
        'true', '(true)' => true,
        'false', '(false)' => false,
        'null', '(null)' => null,
        'empty', '(empty)' => '',
        default => $value,
    };
}

function jp_base_path(): string
{
    $configured = trim((string)env('APP_BASE_PATH', ''));
    if ($configured !== '') {
        return '/' . trim($configured, '/');
    }

    $scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '');
    // Lorsqu'un script public est appelé directement (ex. connexion.php),
    // Apache ne passe pas par router.php. Retrouver la racine à partir du
    // fichier réellement exécuté évite alors les URL avec un chemin physique.
    $scriptFile = realpath((string)($_SERVER['SCRIPT_FILENAME'] ?? ''));
    $root = realpath(JP_ROOT);
    if ($scriptFile !== false && $root !== false && str_starts_with($scriptFile, $root . DIRECTORY_SEPARATOR)) {
        $relativeFile = str_replace('\\', '/', substr($scriptFile, strlen($root)));
        if ($relativeFile !== '' && str_ends_with($scriptName, $relativeFile)) {
            return rtrim(substr($scriptName, 0, -strlen($relativeFile)), '/');
        }
    }
    $marker = '/router.php';
    if (str_ends_with($scriptName, $marker)) {
        return rtrim(substr($scriptName, 0, -strlen($marker)), '/');
    }
    return '';
}

function url(string $path = '/'): string
{
    if (preg_match('~^https?://|^(?:mailto|tel):~i', $path)) {
        return $path;
    }
    $base = jp_base_path();
    $path = '/' . ltrim($path, '/');
    return ($base === '' ? '' : $base) . ($path === '//' ? '/' : $path);
}

function absolute_url(string $path = '/'): string
{
    $origin = rtrim(trim((string)env('APP_URL', '')), '/');
    $originScheme = strtolower((string)(parse_url($origin, PHP_URL_SCHEME) ?? ''));
    $isProduction = (string)env('APP_ENV', 'production') === 'production';
    if ($origin === '' || !filter_var($origin, FILTER_VALIDATE_URL) || ($originScheme !== 'https' && $isProduction)) {
        // Une configuration incomplète ne doit pas produire une page blanche sur
        // les écrans publics. En production, on préfère toujours HTTPS et on
        // ne conserve de l'hôte de la requête que ses caractères autorisés.
        $scheme = $isProduction ? 'https' : ((!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http');
        $host = preg_replace('/[^a-z0-9.:-]/i', '', (string)($_SERVER['HTTP_HOST'] ?? 'localhost'));
        $origin = $scheme . '://' . ($host ?: 'localhost');
        error_log('APP_URL est absente ou invalide : utilisation de l\'origine de la requête.');
    }
    return $origin . url($path);
}

function route_for_script(string $script): ?string
{
    $script = ltrim(str_replace('\\', '/', $script), '/');
    foreach (JP_ROUTES as $route => $target) {
        if ($target === $script && $route !== '/accueil') {
            return $route;
        }
    }
    return null;
}

function app_route(string $route, array $query = []): string
{
    $uri = url($route);
    if ($query !== []) {
        $uri .= '?' . http_build_query($query);
    }
    return $uri;
}

function redirect(string $route, int $status = 302): never
{
    header('Location: ' . (str_starts_with($route, '/') ? url($route) : $route), true, $status);
    exit;
}

function jp_safe_local_redirect(string $candidate, string $fallback = '/'): string
{
    $candidate = trim($candidate);
    if ($candidate === '' || !str_starts_with($candidate, '/') || str_starts_with($candidate, '//')) {
        return $fallback;
    }

    $decoded = rawurldecode($candidate);
    if (str_contains($decoded, '\\') || str_starts_with($decoded, '//') || preg_match('/[\x00-\x1F\x7F]/', $decoded)) {
        return $fallback;
    }

    $parts = parse_url($candidate);
    if ($parts === false || isset($parts['scheme']) || isset($parts['host']) || isset($parts['user']) || isset($parts['pass'])) {
        return $fallback;
    }

    return $candidate;
}

function jp_remember_login_destination(?string $candidate): void
{
    if (!is_string($candidate)) {
        return;
    }

    $destination = jp_safe_local_redirect($candidate, '');
    $path = (string)(parse_url($destination, PHP_URL_PATH) ?? '');
    if ($destination === '' || preg_match('~^/(?:connexion|inscription|deconnexion|auth|mot-de-passe|activation)(?:/|$)~', $path)) {
        return;
    }
    $_SESSION['redirect_after_login'] = $destination;
}

function jp_take_login_destination(string $role): string
{
    $destination = jp_safe_local_redirect((string)($_SESSION['redirect_after_login'] ?? '/'));
    unset($_SESSION['redirect_after_login']);
    return $role === 'admin' ? '/admin' : $destination;
}

function jp_start_user_session(int $userId, string $nom, string $prenom, string $role): void
{
    session_regenerate_id(true);
    $_SESSION['user_id'] = $userId;
    $_SESSION['user_nom'] = $nom;
    $_SESSION['user_prenom'] = $prenom;
    $_SESSION['role'] = $role;
    $_SESSION['_last_rotation'] = time();
    $_SESSION['_auth_user_agent'] = hash('sha256', (string)($_SERVER['HTTP_USER_AGENT'] ?? 'unknown'));
}

function jp_is_https_request(): bool
{
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        return true;
    }
    if ((string)($_SERVER['SERVER_PORT'] ?? '') === '443') {
        return true;
    }
    return strtolower(trim((string)($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? ''))) === 'https';
}

function e(mixed $value): string
{
    return htmlspecialchars((string)$value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function csrf_token(): string
{
    if (empty($_SESSION['_csrf']) || !is_string($_SESSION['_csrf'])) {
        $_SESSION['_csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['_csrf'];
}

function jp_csp_nonce(): string
{
    static $nonce = null;
    if (!is_string($nonce)) {
        $nonce = rtrim(strtr(base64_encode(random_bytes(18)), '+/', '-_'), '=');
    }
    return $nonce;
}

function csrf_field(): string
{
    return '<input type="hidden" name="_csrf" value="' . e(csrf_token()) . '">';
}

function csrf_is_valid(): bool
{
    $provided = $_POST['_csrf'] ?? ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? '');
    return is_string($provided) && hash_equals(csrf_token(), $provided);
}

function jp_same_origin_request(): bool
{
    $origin = trim((string)($_SERVER['HTTP_ORIGIN'] ?? ''));
    if ($origin === '') {
        return true;
    }

    $originHost = strtolower((string)(parse_url($origin, PHP_URL_HOST) ?? ''));
    if ($originHost === '') {
        return false;
    }

    $configuredOrigin = trim((string)env('APP_URL', ''));
    $expectedHost = strtolower((string)(parse_url($configuredOrigin, PHP_URL_HOST) ?? ''));
    if ($expectedHost === '') {
        $expectedHost = strtolower(explode(':', (string)($_SERVER['HTTP_HOST'] ?? ''))[0]);
    }

    return $expectedHost !== '' && hash_equals($expectedHost, $originHost);
}

function jp_abort(int $status, string $message): never
{
    http_response_code($status);
    header('Content-Type: text/html; charset=utf-8');
    echo '<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
    echo '<title>Erreur ' . $status . ' | JP-Services</title><link rel="stylesheet" href="' . e(url('/css/app.css')) . '"></head>';
    echo '<body class="jp-app"><main class="jp-error-page"><div><img src="' . e(url('/images/logo2.png')) . '" alt="JP-Services"><span>Erreur ' . $status . '</span><h1>' . e($message) . '</h1><a class="jp-btn jp-btn-primary" href="' . e(url('/')) . '">Retour à l’accueil</a></div></main></body></html>';
    exit;
}

function require_login(): void
{
    if (empty($_SESSION['user_id'])) {
        $_SESSION['redirect_after_login'] = $_SERVER['REQUEST_URI'] ?? url('/');
        redirect('/connexion');
    }
}

function require_admin(): void
{
    if (empty($_SESSION['user_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
        redirect('/connexion');
    }
}

function jp_rate_limit(string $key, int $limit, int $windowSeconds): bool
{
    $now = time();
    $directory = JP_ROOT . '/storage/cache/rate-limits';
    if (!is_dir($directory) && !mkdir($directory, 0750, true) && !is_dir($directory)) {
        error_log('Impossible de creer le dossier de limitation des tentatives.');
        return false;
    }

    $secret = (string)env('APP_KEY', hash('sha256', JP_ROOT));
    $file = $directory . '/' . hash_hmac('sha256', $key, $secret) . '.json';
    $handle = @fopen($file, 'c+');
    if ($handle === false) {
        error_log('Impossible d ouvrir le compteur de limitation des tentatives.');
        return false;
    }

    try {
        if (!flock($handle, LOCK_EX)) {
            return false;
        }
        $contents = stream_get_contents($handle);
        $bucket = is_string($contents) && $contents !== '' ? json_decode($contents, true) : null;
        if (!is_array($bucket) || ($now - (int)($bucket['start'] ?? 0)) >= $windowSeconds) {
            $bucket = ['start' => $now, 'count' => 0];
        }
        $bucket['count'] = (int)$bucket['count'] + 1;
        ftruncate($handle, 0);
        rewind($handle);
        fwrite($handle, json_encode($bucket, JSON_THROW_ON_ERROR));
        fflush($handle);
        flock($handle, LOCK_UN);
        return $bucket['count'] <= $limit;
    } catch (Throwable $exception) {
        error_log($exception->getMessage());
        return false;
    } finally {
        fclose($handle);
    }
}

function jp_password_policy(string $password): ?string
{
    if (mb_strlen($password, 'UTF-8') < 10) {
        return 'Le mot de passe doit contenir au moins 10 caractères.';
    }
    if (mb_strlen($password, 'UTF-8') > 128) {
        return 'Le mot de passe ne doit pas dépasser 128 caractères.';
    }
    if (!preg_match('/[A-Z]/u', $password) || !preg_match('/[a-z]/u', $password) || !preg_match('/\d/u', $password)) {
        return 'Utilisez au moins une majuscule, une minuscule et un chiffre.';
    }
    if (preg_match('/^(?:123456|password|motdepasse|azerty|qwerty)/iu', $password)) {
        return 'Choisissez un mot de passe moins prévisible.';
    }
    return null;
}

function jp_upload_image(array $file, string $relativeDirectory, int $maxBytes = 5242880): string
{
    if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Le téléversement du fichier a échoué.');
    }
    if (($file['size'] ?? 0) <= 0 || (int)$file['size'] > $maxBytes) {
        throw new RuntimeException('Le fichier dépasse la taille autorisée.');
    }
    $tmp = (string)($file['tmp_name'] ?? '');
    if ($tmp === '' || !is_uploaded_file($tmp)) {
        throw new RuntimeException('Le fichier reçu n’est pas un téléversement valide.');
    }
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $mime = $finfo->file($tmp) ?: '';
    $extensions = [
        'image/jpeg' => 'jpg',
        'image/png' => 'png',
        'image/webp' => 'webp',
        'image/gif' => 'gif',
    ];
    if (!isset($extensions[$mime])) {
        throw new RuntimeException('Format d’image non autorisé.');
    }
    $dimensions = @getimagesize($tmp);
    if (!is_array($dimensions) || empty($dimensions[0]) || empty($dimensions[1])) {
        throw new RuntimeException('Le contenu du fichier image est invalide.');
    }
    $width = (int)$dimensions[0];
    $height = (int)$dimensions[1];
    if ($width > 12000 || $height > 12000 || ($width * $height) > 50000000) {
        throw new RuntimeException('Les dimensions de l’image dépassent la limite autorisée.');
    }
    $relativeDirectory = trim(str_replace('\\', '/', $relativeDirectory), '/');
    $directory = JP_ROOT . '/' . $relativeDirectory;
    if (!is_dir($directory) && !mkdir($directory, 0755, true) && !is_dir($directory)) {
        throw new RuntimeException('Impossible de préparer le dossier de destination.');
    }
    $filename = bin2hex(random_bytes(16)) . '.' . $extensions[$mime];
    if (!move_uploaded_file($tmp, $directory . '/' . $filename)) {
        throw new RuntimeException('Impossible d’enregistrer le fichier.');
    }
    @chmod($directory . '/' . $filename, 0644);
    return $relativeDirectory . '/' . $filename;
}

function jp_actualite_media_column(PDO $conn): string
{
    static $column = null;
    if (is_string($column)) {
        return $column;
    }
    try {
        $columns = $conn->query('SHOW COLUMNS FROM actualites')->fetchAll(PDO::FETCH_COLUMN);
        $column = in_array('media', $columns, true) ? 'media' : 'image';
    } catch (Throwable $exception) {
        error_log($exception->getMessage());
        $column = 'media';
    }
    return $column;
}

function jp_safe_delete_media(?string $relativePath, array $allowedRoots = ['images/profils', 'images/formations', 'images/produits', 'uploads/actualites', 'admin/images']): void
{
    if (!$relativePath) {
        return;
    }
    $normalized = ltrim(str_replace('\\', '/', $relativePath), '/');
    foreach ($allowedRoots as $allowedRoot) {
        $allowedRoot = trim($allowedRoot, '/');
        if ($normalized === $allowedRoot || str_starts_with($normalized, $allowedRoot . '/')) {
            $full = realpath(JP_ROOT . '/' . $normalized);
            $root = realpath(JP_ROOT . '/' . $allowedRoot);
            if ($full && $root && str_starts_with($full, $root . DIRECTORY_SEPARATOR) && is_file($full)) {
                @unlink($full);
            }
            return;
        }
    }
}

function jp_normalize_html_document(string $html): string
{
    if (preg_match_all('~<html\\b[^>]*>~i', $html) <= 1) {
        return $html;
    }

    preg_match_all('~<head\\b[^>]*>(.*?)</head>~is', $html, $heads);
    $headContents = array_values(array_filter(array_map('trim', $heads[1] ?? []), static fn(string $part): bool => $part !== ''));
    $mergedHead = implode("\n", $headContents);
    $headIndex = 0;
    $html = preg_replace_callback(
        '~<head\\b[^>]*>.*?</head>~is',
        static function () use (&$headIndex, $mergedHead): string {
            $headIndex++;
            return $headIndex === 1 ? '<head>' . $mergedHead . '</head>' : '';
        },
        $html
    ) ?? $html;

    $html = preg_replace('~<!doctype\\s+html[^>]*>~i', '', $html) ?? $html;

    $htmlOpenIndex = 0;
    $html = preg_replace_callback('~<html\\b[^>]*>~i', static function (array $match) use (&$htmlOpenIndex): string {
        $htmlOpenIndex++;
        return $htmlOpenIndex === 1 ? $match[0] : '';
    }, $html) ?? $html;

    $bodyOpenIndex = 0;
    $html = preg_replace_callback('~<body\\b[^>]*>~i', static function (array $match) use (&$bodyOpenIndex): string {
        $bodyOpenIndex++;
        return $bodyOpenIndex === 1 ? $match[0] : '';
    }, $html) ?? $html;

    $html = preg_replace('~</body\\s*>~i', '', $html) ?? $html;
    $html = preg_replace('~</html\\s*>~i', '', $html) ?? $html;

    return "<!doctype html>\n" . trim($html) . "\n</body>\n</html>";
}

function jp_html_transform(string $html): string
{
    if ($html === '' || stripos($html, '<html') === false) {
        return $html;
    }

    $html = jp_normalize_html_document($html);
    if (stripos($html, 'class="auth-wrapper') !== false && stripos($html, 'data-auth-language') === false && stripos($html, 'data-auth-use-preferences') === false && function_exists('jp_auth_language_switcher_html')) {
        $languageSwitcher = jp_auth_language_switcher_html((string)($_SERVER['REQUEST_URI'] ?? url('/')));
        $html = preg_replace('~<body\b([^>]*)>~i', '<body$1>' . $languageSwitcher, $html, 1) ?? $html;
    }
    if (stripos($html, 'jpo-page') === false) {
        $html = preg_replace('~(<meta\s+name=["\']theme-color["\']\s+content=["\'])#[0-9a-f]{6}(["\'])~i', '$1#f5f7fc$2', $html) ?? $html;
    }
    // Invalide les styles et scripts déjà en cache après une mise à jour de l'interface.
    $html = preg_replace('~(/css/app\.css\?v=)[A-Za-z0-9._-]+~', '${1}20260909', $html) ?? $html;
    $html = preg_replace('~(/css/site-polish\.css\?v=)[A-Za-z0-9._-]+~', '${1}20260910', $html) ?? $html;
    $html = preg_replace('~(/css/pro-polish\.css\?v=)[A-Za-z0-9._-]+~', '${1}20260918', $html) ?? $html;
    $html = preg_replace('~(/css/interface-v2\.css\?v=)[A-Za-z0-9._-]+~', '${1}20260938', $html) ?? $html;
    $html = preg_replace('~(/js/site-ui\.js\?v=)[A-Za-z0-9._-]+~', '${1}20260918', $html) ?? $html;
    $html = preg_replace('~(/js/pwa\.js\?v=)[A-Za-z0-9._-]+~', '${1}20260909', $html) ?? $html;

    $html = preg_replace_callback(
        '~\b(href|action)=( ["\']|["\'])([^"\']+\.php(?:\?[^"\']*)?)(["\'])~ix',
        static function (array $m): string {
            $attribute = $m[1];
            $raw = html_entity_decode($m[3], ENT_QUOTES | ENT_HTML5, 'UTF-8');
            $parts = parse_url($raw);
            $path = ltrim((string)($parts['path'] ?? ''), '/');
            while (str_starts_with($path, '../')) {
                $path = substr($path, 3);
            }
            if (str_starts_with($path, 'admin/')) {
                $script = $path;
            } elseif (str_contains($_SERVER['JP_TARGET_SCRIPT'] ?? '', 'admin/') && !str_contains($path, '/')) {
                $script = 'admin/' . $path;
            } else {
                $script = $path;
            }
            $route = route_for_script($script);
            if ($route === null) {
                return $m[0];
            }
            $new = url($route);
            if (!empty($parts['query'])) {
                $new .= '?' . $parts['query'];
            }
            if (!empty($parts['fragment'])) {
                $new .= '#' . $parts['fragment'];
            }
            return $attribute . '=' . $m[2] . e($new) . $m[4];
        },
        $html
    ) ?? $html;

    $token = e(csrf_token());
    $html = preg_replace_callback(
        '~<form\b([^>]*)>~i',
        static function (array $m) use ($token): string {
            $attrs = $m[1];
            if (!preg_match('~\bmethod\s*=\s*["\']?post\b~i', $attrs) || preg_match('~\bname\s*=\s*["\']_csrf["\']~i', $attrs)) {
                return $m[0];
            }
            return '<form' . $attrs . '><input type="hidden" name="_csrf" value="' . $token . '">';
        },
        $html
    ) ?? $html;

    if (stripos($html, 'name="csrf-token"') === false) {
        $meta = '<meta name="csrf-token" content="' . $token . '">';
        $css = (stripos($html, '/css/app.css') === false && stripos($html, 'css/app.css') === false
            ? '<link rel="stylesheet" href="' . e(url('/css/app.css?v=20260909')) . '">' 
            : '')
            . (stripos($html, '/css/interface-v2.css') === false && stripos($html, 'css/interface-v2.css') === false
                ? '<link rel="stylesheet" href="' . e(url('/css/interface-v2.css?v=20260938')) . '">' 
                : '');
        $icons = stripos($html, 'fa-') !== false && stripos($html, 'font-awesome') === false && stripos($html, 'fontawesome') === false
            ? '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">'
            : '';
        $script = '<script>window.JP_CSRF=' . json_encode(csrf_token(), JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) . ';(()=>{const f=window.fetch;window.fetch=function(i,o={}){try{const u=typeof i==="string"?new URL(i,location.href):new URL(i.url,location.href);if(u.origin===location.origin){const h=new Headers(o.headers||{});h.set("X-CSRF-Token",window.JP_CSRF);o.headers=h;o.credentials=o.credentials||"same-origin"}}catch(e){}return f.call(this,i,o)}})();</script>';
        $html = preg_replace('~</head>~i', $meta . $icons . $css . $script . '</head>', $html, 1) ?? $html;
    }

    $bodyClass = str_contains((string)($_SERVER['JP_TARGET_SCRIPT'] ?? ''), 'admin/') ? 'jp-app jp-admin' : 'jp-app';
    if (preg_match('~<body\b([^>]*)>~i', $html)) {
        $html = preg_replace_callback('~<body\b([^>]*)>~i', static function (array $m) use ($bodyClass): string {
            $attrs = $m[1];
            if (preg_match('~\bclass\s*=\s*(["\'])(.*?)\1~i', $attrs, $cm)) {
                $classes = trim($cm[2] . ' ' . $bodyClass);
                $attrs = preg_replace('~\bclass\s*=\s*(["\'])(.*?)\1~i', 'class="' . e($classes) . '"', $attrs, 1) ?? $attrs;
            } else {
                $attrs .= ' class="' . $bodyClass . '"';
            }
            return '<body' . $attrs . '>';
        }, $html, 1) ?? $html;
    }

    $html = preg_replace('~<img\b(?![^>]*\bloading=)([^>]+)>~i', '<img loading="lazy" decoding="async"$1>', $html) ?? $html;
    if (stripos($html, '/js/site-ui.js') === false && stripos($html, 'js/site-ui.js') === false) {
        $uiScript = '<script src="' . e(url('/js/site-ui.js?v=20260918')) . '" defer></script>';
        $html = preg_replace('~</body>~i', $uiScript . '</body>', $html, 1) ?? $html;
    }
    $nonce = e(jp_csp_nonce());
    $html = preg_replace('~<script\b(?![^>]*\bnonce=)([^>]*)>~i', '<script nonce="' . $nonce . '"$1>', $html) ?? $html;
    return function_exists('jp_translate_interface_html') ? jp_translate_interface_html($html) : $html;
}

$appEnv = (string)env('APP_ENV', 'production');
$isProduction = $appEnv === 'production';
ini_set('display_errors', $isProduction ? '0' : '1');
ini_set('log_errors', '1');
ini_set('error_log', JP_ROOT . '/storage/logs/php-error.log');
error_reporting(E_ALL);

date_default_timezone_set((string)env('APP_TIMEZONE', 'Africa/Lubumbashi'));

ini_set('session.use_strict_mode', '1');
ini_set('session.use_only_cookies', '1');
ini_set('session.cookie_httponly', '1');
ini_set('session.cookie_samesite', 'Lax');

if (session_status() !== PHP_SESSION_ACTIVE) {
    $secure = jp_is_https_request();
    session_name((string)env('SESSION_NAME', 'jp_session'));
    session_set_cookie_params([
        'lifetime' => 0,
        'path' => jp_base_path() ?: '/',
        'domain' => '',
        'secure' => $secure,
        'httponly' => true,
        'samesite' => 'Lax',
    ]);
    session_start();
}

$now = time();
$idleTimeout = max(900, (int)env('SESSION_IDLE_TIMEOUT', 7200));
$rotateInterval = max(300, (int)env('SESSION_ROTATE_INTERVAL', 900));
if (!empty($_SESSION['_last_activity']) && ($now - (int)$_SESSION['_last_activity']) > $idleTimeout) {
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], (bool)$params['secure'], (bool)$params['httponly']);
    }
    session_destroy();
    session_start();
}
$_SESSION['_last_activity'] = $now;
if (empty($_SESSION['_last_rotation']) || ($now - (int)$_SESSION['_last_rotation']) > $rotateInterval) {
    session_regenerate_id(true);
    $_SESSION['_last_rotation'] = $now;
}

if (!empty($_SESSION['user_id'])) {
    $userAgentFingerprint = hash('sha256', (string)($_SERVER['HTTP_USER_AGENT'] ?? 'unknown'));
    if (!empty($_SESSION['_auth_user_agent']) && !hash_equals((string)$_SESSION['_auth_user_agent'], $userAgentFingerprint)) {
        $_SESSION = [];
        session_regenerate_id(true);
        $_SESSION['security_flash'] = 'Votre session a été interrompue par mesure de sécurité. Veuillez vous reconnecter.';
        redirect('/connexion');
    }
    $_SESSION['_auth_user_agent'] = $userAgentFingerprint;
}

require_once JP_ROOT . '/app/i18n.php';
require_once JP_ROOT . '/app/site_settings.php';

if (!headers_sent()) {
    header_remove('X-Powered-By');
    header('Content-Type: text/html; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    header('X-Frame-Options: SAMEORIGIN');
    header('Referrer-Policy: strict-origin-when-cross-origin');
    header('Permissions-Policy: camera=(self "https://meet.jit.si"), microphone=(self "https://meet.jit.si"), geolocation=(self), payment=()');
    header("Cross-Origin-Opener-Policy: same-origin-allow-popups");
    header('X-Permitted-Cross-Domain-Policies: none');
    header('Vary: Cookie, Accept-Language', false);
    if (!empty($_SESSION['user_id'])) {
        header('Cache-Control: no-store, private');
        header('Pragma: no-cache');
    }
    $cspNonce = jp_csp_nonce();
    header("Content-Security-Policy: default-src 'self'; base-uri 'self'; form-action 'self' https://accounts.google.com; frame-ancestors 'self'; object-src 'none'; script-src 'self' 'nonce-{$cspNonce}' https://www.google.com https://www.gstatic.com https://meet.jit.si https://accounts.google.com; script-src-attr 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://accounts.google.com; font-src 'self' data: https://fonts.gstatic.com https://cdnjs.cloudflare.com; img-src 'self' data: blob: https:; media-src 'self' blob:; connect-src 'self' https://www.google.com https://accounts.google.com https://oauth2.googleapis.com https://meet.jit.si wss://meet.jit.si https://*.jitsi.net wss://*.jitsi.net; frame-src https://www.google.com https://recaptcha.google.com https://meet.jit.si https://accounts.google.com; worker-src 'self'; manifest-src 'self'");
    if ($isProduction && !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') {
        header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
    }
}

$method = strtoupper((string)($_SERVER['REQUEST_METHOD'] ?? 'GET'));
if (in_array($method, ['POST', 'PUT', 'PATCH', 'DELETE'], true)) {
    $requestPathForCsrf = (string)(parse_url((string)($_SERVER['REQUEST_URI'] ?? ''), PHP_URL_PATH) ?? '');
    if (!jp_same_origin_request()) {
        jp_abort(403, 'Origine de requête non autorisée.');
    }
    if (!csrf_is_valid()) {
        jp_abort(403, 'La session de sécurité a expiré. Rechargez la page puis recommencez.');
    }
}

if (!headers_sent()) {
    $requestUri = (string)($_SERVER['REQUEST_URI'] ?? '');
    $requestPath = (string)(parse_url($requestUri, PHP_URL_PATH) ?? '');
    if (preg_match('~\.php$~i', $requestPath)) {
        $base = jp_base_path();
        $relative = ltrim($base !== '' && str_starts_with($requestPath, $base) ? substr($requestPath, strlen($base)) : $requestPath, '/');
        $route = route_for_script($relative);
        if ($route !== null) {
            $location = url($route);
            $query = (string)(parse_url($requestUri, PHP_URL_QUERY) ?? '');
            if ($query !== '') {
                $location .= '?' . $query;
            }
            header('Location: ' . $location, true, 301);
            exit;
        }
    }
}

ob_start('jp_html_transform');
