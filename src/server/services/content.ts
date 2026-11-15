import "server-only";
import { cache } from "react";
import { and, asc, desc, eq, gte, inArray, like, or, sql } from "drizzle-orm";
import { db, schema } from "@/server/db";

/* ───── Actualités ───── */
export const listActualites = cache(async (limit = 50, offset = 0) =>
  db.select().from(schema.actualites).orderBy(desc(schema.actualites.datePublication)).limit(limit).offset(offset),
);
export const countActualites = cache(async () => Number((await db.select({ c: sql<number>`COUNT(*)` }).from(schema.actualites))[0]?.c ?? 0));
export const getActualite = cache(async (id: number) => (await db.select().from(schema.actualites).where(eq(schema.actualites.id, id)).limit(1))[0] ?? null);

/* ───── Logiciels ───── */
export const listLogicielCategories = cache(async () => db.select().from(schema.logicielCategories).orderBy(asc(schema.logicielCategories.ordre), asc(schema.logicielCategories.nom)));
export const listLogiciels = cache(async (includeDrafts = false) =>
  db
    .select({ logiciel: schema.logiciels, categorie: schema.logicielCategories })
    .from(schema.logiciels)
    .leftJoin(schema.logicielCategories, eq(schema.logicielCategories.id, schema.logiciels.categorieId))
    .where(includeDrafts ? undefined : eq(schema.logiciels.statut, "publie"))
    .orderBy(desc(schema.logiciels.misAJour)),
);
export const getLogiciel = cache(async (id: number) => (await db.select().from(schema.logiciels).where(eq(schema.logiciels.id, id)).limit(1))[0] ?? null);

/* ───── Partenaires ───── */
export const listPartenaires = cache(async (onlyActive = true) =>
  db
    .select()
    .from(schema.partenaires)
    .where(onlyActive ? eq(schema.partenaires.actif, 1) : undefined)
    .orderBy(asc(schema.partenaires.ordre), asc(schema.partenaires.nom)),
);

/* ───── Équipe ───── */
export const listEquipe = cache(async () => db.select().from(schema.equipe).orderBy(asc(schema.equipe.ordre), asc(schema.equipe.nom)));

/* ───── Produits ───── */
export const listProduits = cache(async () => db.select().from(schema.produits).orderBy(desc(schema.produits.dateCreation)));

/* ───── Sessions en direct ───── */
export const listLiveSessions = cache(async (opts: { upcomingOnly?: boolean } = {}) =>
  db
    .select({ session: schema.liveSessions, formationTitre: schema.formations.titre })
    .from(schema.liveSessions)
    .leftJoin(schema.formations, eq(schema.formations.id, schema.liveSessions.formationId))
    .where(
      opts.upcomingOnly
        ? and(inArray(schema.liveSessions.statut, ["planifiee", "en_cours"]), gte(schema.liveSessions.dateDebut, new Date(Date.now() - 6 * 3600_000)))
        : undefined,
    )
    .orderBy(asc(schema.liveSessions.dateDebut)),
);
export const getLiveSession = cache(async (id: number) => {
  const rows = await db
    .select({ session: schema.liveSessions, formationTitre: schema.formations.titre })
    .from(schema.liveSessions)
    .leftJoin(schema.formations, eq(schema.formations.id, schema.liveSessions.formationId))
    .where(eq(schema.liveSessions.id, id))
    .limit(1);
  return rows[0] ?? null;
});

/* ───── Forum ───── */
export async function listPosts(viewerId = 0) {
  return db
    .select({
      id: schema.posts.id,
      titre: schema.posts.titre,
      contenu: schema.posts.contenu,
      datePublication: schema.posts.datePublication,
      auteurId: schema.posts.auteurId,
      auteurNom: schema.users.nom,
      auteurPrenom: schema.users.prenom,
      auteurPhoto: schema.users.photoProfil,
      totalLikes: sql<number>`(SELECT COUNT(*) FROM likes l WHERE l.post_id = ${schema.posts.id})`,
      totalComments: sql<number>`(SELECT COUNT(*) FROM comments c WHERE c.post_id = ${schema.posts.id})`,
      likedByViewer: sql<number>`EXISTS(SELECT 1 FROM likes ml WHERE ml.post_id = ${schema.posts.id} AND ml.user_id = ${viewerId})`,
    })
    .from(schema.posts)
    .innerJoin(schema.users, eq(schema.users.id, schema.posts.auteurId))
    .orderBy(desc(schema.posts.datePublication), desc(schema.posts.id));
}
export async function getPost(id: number, viewerId = 0) {
  const rows = await db
    .select({
      id: schema.posts.id,
      titre: schema.posts.titre,
      contenu: schema.posts.contenu,
      datePublication: schema.posts.datePublication,
      auteurId: schema.posts.auteurId,
      auteurNom: schema.users.nom,
      auteurPrenom: schema.users.prenom,
      auteurPhoto: schema.users.photoProfil,
      totalLikes: sql<number>`(SELECT COUNT(*) FROM likes l WHERE l.post_id = ${schema.posts.id})`,
      likedByViewer: sql<number>`EXISTS(SELECT 1 FROM likes ml WHERE ml.post_id = ${schema.posts.id} AND ml.user_id = ${viewerId})`,
    })
    .from(schema.posts)
    .innerJoin(schema.users, eq(schema.users.id, schema.posts.auteurId))
    .where(eq(schema.posts.id, id))
    .limit(1);
  return rows[0] ?? null;
}
export async function listComments(postId: number) {
  return db
    .select({ id: schema.comments.id, contenu: schema.comments.contenu, date: schema.comments.dateCommentaire, userId: schema.comments.userId, nom: schema.users.nom, prenom: schema.users.prenom, photo: schema.users.photoProfil })
    .from(schema.comments)
    .innerJoin(schema.users, eq(schema.users.id, schema.comments.userId))
    .where(eq(schema.comments.postId, postId))
    .orderBy(asc(schema.comments.dateCommentaire));
}

/* ───── Projets ───── */
export async function listUserProjects(userId: number) {
  return db.select().from(schema.projets).where(eq(schema.projets.auteurId, userId)).orderBy(desc(schema.projets.dateSoumission));
}
export async function listValidatedProjects() {
  return db
    .select({ projet: schema.projets, auteurNom: schema.users.nom, auteurPrenom: schema.users.prenom })
    .from(schema.projets)
    .innerJoin(schema.users, eq(schema.users.id, schema.projets.auteurId))
    .where(inArray(schema.projets.statut, ["valide", "approuve"]))
    .orderBy(desc(schema.projets.dateSoumission));
}
export async function getProject(id: number) {
  const rows = await db
    .select({ projet: schema.projets, auteurNom: schema.users.nom, auteurPrenom: schema.users.prenom })
    .from(schema.projets)
    .innerJoin(schema.users, eq(schema.users.id, schema.projets.auteurId))
    .where(eq(schema.projets.id, id))
    .limit(1);
  return rows[0] ?? null;
}

/* ───── Statistiques d’accueil ───── */
export const getHomeStats = cache(async () => {
  const [f, m, l, t, s] = await Promise.all([
    db.select({ c: sql<number>`COUNT(*)` }).from(schema.formations),
    db.select({ c: sql<number>`COUNT(*)` }).from(schema.users).where(eq(schema.users.isActive, 1)),
    db.select({ c: sql<number>`COUNT(*)` }).from(schema.logiciels).where(eq(schema.logiciels.statut, "publie")),
    db.select({ c: sql<number>`COALESCE(SUM(telechargements),0)` }).from(schema.logiciels).where(eq(schema.logiciels.statut, "publie")),
    db.select({ c: sql<number>`COUNT(*)` }).from(schema.liveSessions).where(inArray(schema.liveSessions.statut, ["planifiee", "en_cours"])),
  ]);
  return {
    formations: Number(f[0]?.c ?? 0),
    membres: Number(m[0]?.c ?? 0),
    logiciels: Number(l[0]?.c ?? 0),
    telechargements: Number(t[0]?.c ?? 0),
    sessions: Number(s[0]?.c ?? 0),
  };
});

/* ───── Recherche globale ───── */
export type SearchResult = { type: "formations" | "logiciels" | "actualites" | "posts"; id: number; title: string; excerpt: string; href: string };
export async function searchSite(query: string, limitPerType = 5): Promise<SearchResult[]> {
  const q = query.trim().slice(0, 100);
  if (q.length < 2) return [];
  const term = `%${q.replace(/[%_]/g, (c) => "\\" + c)}%`;
  const [f, l, a, p] = await Promise.all([
    db.select({ id: schema.formations.id, title: schema.formations.titre, excerpt: schema.formations.description }).from(schema.formations).where(or(like(schema.formations.titre, term), like(schema.formations.description, term))).limit(limitPerType),
    db.select({ id: schema.logiciels.id, title: schema.logiciels.nom, excerpt: schema.logiciels.description }).from(schema.logiciels).where(and(eq(schema.logiciels.statut, "publie"), or(like(schema.logiciels.nom, term), like(schema.logiciels.description, term)))).limit(limitPerType),
    db.select({ id: schema.actualites.id, title: schema.actualites.titre, excerpt: schema.actualites.contenu }).from(schema.actualites).where(or(like(schema.actualites.titre, term), like(schema.actualites.contenu, term))).limit(limitPerType),
    db.select({ id: schema.posts.id, title: schema.posts.titre, excerpt: schema.posts.contenu }).from(schema.posts).where(or(like(schema.posts.titre, term), like(schema.posts.contenu, term))).limit(limitPerType),
  ]);
  const clip = (s: string | null) => (s ?? "").replace(/\s+/g, " ").slice(0, 140);
  return [
    ...f.map((r) => ({ type: "formations" as const, id: r.id, title: r.title, excerpt: clip(r.excerpt), href: `/formations/${r.id}` })),
    ...l.map((r) => ({ type: "logiciels" as const, id: r.id, title: r.title, excerpt: clip(r.excerpt), href: `/logiciels#logiciel-${r.id}` })),
    ...a.map((r) => ({ type: "actualites" as const, id: r.id, title: r.title, excerpt: clip(r.excerpt), href: `/actualites/${r.id}` })),
    ...p.map((r) => ({ type: "posts" as const, id: r.id, title: r.title, excerpt: clip(r.excerpt), href: `/forum/${r.id}` })),
  ];
}
