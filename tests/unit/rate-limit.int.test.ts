import { describe, expect, it } from "vitest";

/** Test d’intégration : nécessite une base PostgreSQL (DATABASE_URL). Ignoré sinon. */
const url = process.env.DATABASE_URL ?? "";
describe.skipIf(!url.startsWith("postgres"))("limitation de débit (PostgreSQL)", () => {
  it("compte les tentatives et bloque au-delà de la limite", async () => {
    process.env.APP_SECRET ??= "test-secret-0123456789abcdefghijklmnopqrstuvwxyz";
    process.env.SKIP_ENV_VALIDATION = "1";
    const { rateLimit } = await import("@/server/security/rate-limit");
    const key = `test:${Date.now()}`;
    expect(await rateLimit(key, 2, 60)).toBe(true);
    expect(await rateLimit(key, 2, 60)).toBe(true);
    expect(await rateLimit(key, 2, 60)).toBe(false);
  });
});
