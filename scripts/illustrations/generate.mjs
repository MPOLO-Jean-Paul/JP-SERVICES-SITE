/**
 * Génère les illustrations vectorielles originales de JP-Services dans public/illustrations.
 * Usage : pnpm illustrations
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import * as S from "./scenes.mjs";

const out = path.join(process.cwd(), "public", "illustrations");
await mkdir(out, { recursive: true });
const files = {
  "hero-apprenante.svg": S.hero(),
  "apprendre-partout.svg": S.apprendre(),
  "formateur-en-ligne.svg": S.formateur(),
  "projet-equipe.svg": S.projet(),
  "domaine-formations.svg": S.domFormation(),
  "domaine-logiciels.svg": S.domLogiciels(),
  "domaine-projets.svg": S.domProjets(),
  "scolia-gestion.svg": S.scolia(),
  "contact-conseillere.svg": S.support(),
  "a-propos-equipe.svg": S.equipe(),
  "aide-questions.svg": S.questions(),
  "actualites-journal.svg": S.journal(),
  "page-introuvable.svg": S.perdu(),
  "etat-vide.svg": S.vide(),
};
for (let i = 0; i < 6; i++) files[`avatar-${i + 1}.svg`] = S.avatar(i);
for (const [name, content] of Object.entries(files)) {
  // Fichiers autonomes : identifiants internes préfixés pour éviter toute collision une fois intégrés.
  const prefix = name.replace(/\.svg$/, "");
  const svg = content.replace(/id="([^"]+)"/g, `id="${prefix}-$1"`).replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`);
  await writeFile(path.join(out, name), svg + "\n");
  console.log("✔", name, `${(svg.length / 1024).toFixed(1)} ko`);
}
