<?php

declare(strict_types=1);

$rawPath = (string)(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/');
if (PHP_SAPI === 'cli-server') {
    $candidate = realpath(__DIR__ . '/' . ltrim($rawPath, '/'));
    $root = realpath(__DIR__);
    $extension = strtolower(pathinfo($rawPath, PATHINFO_EXTENSION));
    $publicExtensions = ['css', 'js', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'avif', 'svg', 'ico', 'woff', 'woff2', 'mp4', 'webm', 'webmanifest', 'json', 'html'];
    $relativePath = strtolower(str_replace('\\', '/', ltrim($rawPath, '/')));
    $privatePath = preg_match('~^(?:app|config|includes|storage|\.git)(?:/|$)~', $relativePath) === 1;
    if ($candidate && $root && !$privatePath && in_array($extension, $publicExtensions, true) && str_starts_with($candidate, $root . DIRECTORY_SEPARATOR) && is_file($candidate)) {
        return false;
    }
}

require_once __DIR__ . '/app/bootstrap.php';

$path = (string)(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?? '/');
$base = jp_base_path();
if ($base !== '' && str_starts_with($path, $base)) {
    $path = substr($path, strlen($base)) ?: '/';
}
$path = '/' . trim($path, '/');
if ($path === '//') {
    $path = '/';
}

$target = JP_ROUTES[$path] ?? null;
if ($target === null) {
    jp_abort(404, 'Cette page est introuvable.');
}

$fullPath = realpath(JP_ROOT . '/' . $target);
if ($fullPath === false || !str_starts_with($fullPath, JP_ROOT . DIRECTORY_SEPARATOR) || !is_file($fullPath)) {
    jp_abort(404, 'Cette page est introuvable.');
}

$_SERVER['JP_TARGET_SCRIPT'] = $target;
$_SERVER['SCRIPT_NAME'] = url('/' . $target);
$_SERVER['PHP_SELF'] = $_SERVER['SCRIPT_NAME'];
chdir(dirname($fullPath));
require $fullPath;
