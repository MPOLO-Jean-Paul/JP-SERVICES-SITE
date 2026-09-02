<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/app/bootstrap.php';
$host = trim((string)env('DB_HOST', '127.0.0.1'));
$port = (int)env('DB_PORT', 3306);
$name = trim((string)env('DB_NAME', 'jp_services'));
$user = trim((string)env('DB_USER', 'root'));
$pass = (string)env('DB_PASSWORD', '');

// Un mot de passe vide reste valide pour une instance MySQL locale Laragon.
// En production, la connexion PDO échouera normalement si l'hébergeur exige
// un mot de passe ; on ne confond donc pas « vide » et « non configuré ».
if ($host === '' || $name === '' || $user === '') {
    error_log('Configuration DB incomplète. Vérifiez le fichier .env.');
    jp_abort(503, 'Le service est momentanément indisponible.');
}

try {
    $dsn = sprintf('mysql:host=%s;port=%d;dbname=%s;charset=utf8mb4', $host, $port, $name);
    $conn = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci',
    ]);
} catch (PDOException $exception) {
    error_log('Database connection failed: ' . $exception->getMessage());
    jp_abort(503, 'Le service est momentanément indisponible.');
}
