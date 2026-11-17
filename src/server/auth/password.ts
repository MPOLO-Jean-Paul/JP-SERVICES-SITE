import "server-only";
import bcrypt from "bcryptjs";

/**
 * Les comptes historiques ont été hachés par PHP `password_hash` (bcrypt, préfixe $2y$).
 * bcryptjs vérifie ces condensats sans migration : les membres gardent leur mot de passe.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!hash) return false;
  try {
    return await bcrypt.compare(password, hash.replace(/^\$2y\$/, "$2a$"));
  } catch {
    return false;
  }
}

export function passwordNeedsRehash(hash: string): boolean {
  const m = /^\$2[aby]\$(\d{2})\$/.exec(hash);
  return !m || Number(m[1]) < 12;
}

const WEAK_PREFIXES = /^(?:123456|password|motdepasse|azerty|qwerty|jpservices)/i;

/** Politique : 8 à 128 caractères, majuscule, minuscule et chiffre. Retourne une clé de message ou null. */
export function passwordPolicyError(password: string): "tooShort" | "tooLong" | "complexity" | "predictable" | null {
  if (password.length < 8) return "tooShort";
  if (password.length > 128) return "tooLong";
  if (!/[A-Z]/u.test(password) || !/[a-z]/u.test(password) || !/\d/u.test(password)) return "complexity";
  if (WEAK_PREFIXES.test(password)) return "predictable";
  return null;
}
