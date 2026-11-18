import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../src/server/db/schema";
import { ensureBaseData } from "./base-data";

/**
 * Crée le premier administrateur au démarrage, sans console Shell (plan gratuit Render) :
 * il suffit de définir ADMIN_EMAIL et ADMIN_PASSWORD dans l’onglet « Environment ».
 *
 * Sécurité : n’agit QUE s’il n’existe encore aucun administrateur. Une fois un compte
 * administrateur présent, les variables sont ignorées (aucun mot de passe n’est jamais
 * écrasé au redémarrage) ; il est conseillé de supprimer ADMIN_PASSWORD ensuite.
 */
export async function ensureFirstAdmin(db: PostgresJsDatabase<typeof schema>) {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) return;

  const existing = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.role, "admin")).limit(1);
  if (existing.length) {
    console.log("ℹ Un administrateur existe déjà : ADMIN_EMAIL / ADMIN_PASSWORD sont ignorés. Vous pouvez supprimer ADMIN_PASSWORD dans Render.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.warn("⚠ ADMIN_EMAIL n’est pas une adresse e-mail valide : administrateur non créé.");
    return;
  }
  if (password.length < 10 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    console.warn("⚠ ADMIN_PASSWORD trop faible (10 caractères minimum, avec majuscule, minuscule et chiffre) : administrateur non créé.");
    return;
  }

  await ensureBaseData(db);
  const hash = await bcrypt.hash(password, 12);
  await db
    .insert(schema.users)
    .values({ nom: "Administrateur", prenom: "JP-Services", email, motDePasse: hash, role: "admin", isActive: 1 })
    .onConflictDoUpdate({ target: schema.users.email, set: { role: "admin", isActive: 1, motDePasse: hash } });
  console.log(`✔ Premier administrateur créé : ${email}. Supprimez maintenant ADMIN_PASSWORD dans Render.`);
}
