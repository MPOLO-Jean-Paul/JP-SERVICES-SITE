import { describe, expect, it } from "vitest";
import bcrypt from "bcryptjs";
import { hashPassword, passwordNeedsRehash, passwordPolicyError, verifyPassword } from "@/server/auth/password";

describe("politique de mot de passe", () => {
  it("applique les règles", () => {
    expect(passwordPolicyError("Court1")).toBe("tooShort");
    expect(passwordPolicyError("Abcdef1")).toBe("tooShort");
    expect(passwordPolicyError("Abcdefg1")).toBeNull();
    expect(passwordPolicyError("toutenminuscule1")).toBe("complexity");
    expect(passwordPolicyError("Azerty12345")).toBe("predictable");
    expect(passwordPolicyError("Solide-Passe-2026")).toBeNull();
    expect(passwordPolicyError("A1a".repeat(50))).toBe("tooLong");
  });
});

describe("hachage", () => {
  it("vérifie les condensats créés par la nouvelle plateforme", async () => {
    const hash = await hashPassword("Solide-Passe-2026");
    expect(await verifyPassword("Solide-Passe-2026", hash)).toBe(true);
    expect(await verifyPassword("mauvais", hash)).toBe(false);
    expect(passwordNeedsRehash(hash)).toBe(false);
  });
  it("accepte les condensats PHP historiques ($2y$) pour ne pas perdre les comptes existants", async () => {
    const legacy = (await bcrypt.hash("AncienMotDePasse1", 10)).replace(/^\$2[ab]\$/, "$2y$");
    expect(legacy.startsWith("$2y$10$")).toBe(true);
    expect(await verifyPassword("AncienMotDePasse1", legacy)).toBe(true);
    expect(passwordNeedsRehash(legacy)).toBe(true);
  });
});
