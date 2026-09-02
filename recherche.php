<?php
require_once __DIR__ . '/app/bootstrap.php';
require_once __DIR__ . '/includes/connexion_db.php';

$query = trim((string)($_GET['query'] ?? ''));
$results = [];
$error = '';
if ($query !== '') {
    if (mb_strlen($query) < 2) {
        $error = 'Saisissez au moins deux caractères.';
    } elseif (mb_strlen($query) > 100) {
        $error = 'La recherche est trop longue.';
    } else {
        try {
            $search = '%' . $query . '%';
            $sql = "SELECT id, 'Actualité' AS type, titre, contenu FROM actualites WHERE titre LIKE :news_title OR contenu LIKE :news_body
                    UNION ALL
                    SELECT id, 'Formation' AS type, titre, description AS contenu FROM formations WHERE titre LIKE :training_title OR description LIKE :training_body
                    UNION ALL
                    SELECT id, 'Forum' AS type, titre, contenu FROM posts WHERE titre LIKE :post_title OR contenu LIKE :post_body
                    LIMIT 80";
            $stmt = $conn->prepare($sql);
            $stmt->execute([
                ':news_title'=>$search, ':news_body'=>$search,
                ':training_title'=>$search, ':training_body'=>$search,
                ':post_title'=>$search, ':post_body'=>$search,
            ]);
            $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
            try {
                $softStmt = $conn->prepare("SELECT id, 'Logiciel' AS type, nom AS titre, description AS contenu FROM logiciels WHERE statut = 'publie' AND (nom LIKE :soft_name OR description LIKE :soft_body) LIMIT 20");
                $softStmt->execute([':soft_name'=>$search, ':soft_body'=>$search]);
                $results = array_merge($results, $softStmt->fetchAll(PDO::FETCH_ASSOC));
            } catch (Throwable $softException) {
                error_log('Recherche logiciels: ' . $softException->getMessage());
            }
        } catch (Throwable $exception) {
            error_log('Recherche: ' . $exception->getMessage());
            $error = 'La recherche est momentanément indisponible.';
        }
    }
}

function jp_highlight(string $text, string $query): string
{
    $escaped = e($text);
    if ($query === '') return $escaped;
    return preg_replace('/(' . preg_quote(e($query), '/') . ')/iu', '<mark>$1</mark>', $escaped) ?? $escaped;
}

function jp_result_url(array $result): string
{
    $id = (int)($result['id'] ?? 0);
    return match ((string)($result['type'] ?? '')) {
        'Actualité' => app_route('/actualite', ['id' => $id]),
        'Formation' => app_route('/formation', ['id' => $id]),
        'Forum' => app_route('/commentaires', ['post_id' => $id]),
        'Logiciel' => app_route('/logiciels'),
        default => url('/recherche'),
    };
}
?>
<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Recherche | JP-SERVICES</title>
<style>.search-result{padding:1.4rem 0;border-bottom:1px solid var(--jp-line)}.search-result:last-child{border-bottom:0}.search-result mark{background:#fff1a8;padding:0 .12rem;border-radius:.2rem}</style></head><body>
<?php include __DIR__ . '/includes/header.php'; ?>
<main class="container py-5"><div class="mx-auto" style="max-width:950px"><span class="jp-eyebrow">Recherche globale</span><h1 class="mb-4">Rechercher sur JP-SERVICES</h1><form class="jp-surface p-3 mb-4" method="get" action="<?= e(app_route('/recherche')) ?>"><div class="input-group"><input class="form-control" type="search" name="query" maxlength="100" value="<?= e($query) ?>" placeholder="Actualités, formations, projets, forum…" aria-label="Rechercher"><button class="jp-btn jp-btn-primary" type="submit"><i class="fa-solid fa-magnifying-glass"></i> Rechercher</button></div></form>
<?php if ($error !== ''): ?><div class="alert alert-danger"><?= e($error) ?></div><?php elseif ($query === ''): ?><div class="jp-surface p-5 text-center"><i class="fa-solid fa-magnifying-glass fa-2x mb-3 text-muted"></i><p class="mb-0 text-muted">Saisissez un mot-clé pour explorer les contenus du site.</p></div><?php elseif ($results === []): ?><div class="jp-surface p-5 text-center"><h2 class="h4">Aucun résultat</h2><p class="mb-0 text-muted">Aucun contenu ne correspond à « <?= e($query) ?> ».</p></div><?php else: ?><div class="d-flex justify-content-between align-items-center mb-2"><h2 class="h4 mb-0"><?= count($results) ?> résultat<?= count($results)>1?'s':'' ?></h2><span class="text-muted">« <?= e($query) ?> »</span></div><div class="jp-surface px-4"><?php foreach ($results as $result): ?><article class="search-result"><span class="badge bg-light text-dark border mb-2"><?= e($result['type']) ?></span><h3 class="h5"><a href="<?= e(jp_result_url($result)) ?>" class="text-decoration-none"><?= jp_highlight((string)$result['titre'], $query) ?></a></h3><p class="mb-0 text-muted"><?= jp_highlight(mb_strimwidth(strip_tags((string)$result['contenu']), 0, 260, '…'), $query) ?></p></article><?php endforeach; ?></div><?php endif; ?></div></main>
<?php include __DIR__ . '/includes/footer.php'; ?></body></html>
