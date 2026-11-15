import { expect, test } from "@playwright/test";
import { acceptCookies } from "./helpers";

test.beforeEach(async ({ page }) => acceptCookies(page));

const PAGES: Array<[string, RegExp]> = [
  ["/", /compétences/i],
  ["/formations", /compétence/i],
  ["/logiciels", /logiciels/i],
  ["/scolia", /SCOLIA Pro/i],
  ["/formations-en-ligne", /direct/i],
  ["/projets", /projet/i],
  ["/forum", /ensemble/i],
  ["/actualites", /Actualités/i],
  ["/partenariat", /ensemble/i],
  ["/a-propos", /propos/i],
  ["/contact", /Contactez/i],
  ["/aide", /aide/i],
  ["/conditions", /Conditions/i],
  ["/confidentialite", /confidentialité/i],
  ["/cookies", /cookies/i],
];

for (const [path, heading] of PAGES) {
  test(`la page ${path} s’affiche sans erreur`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    const res = await page.goto(path);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1").first()).toContainText(heading);
    expect(errors).toEqual([]);
  });
}

test("les anciennes URL PHP redirigent vers les nouvelles routes", async ({ request }) => {
  const res = await request.get("/formations.php", { maxRedirects: 0 });
  expect([301, 308]).toContain(res.status());
  expect(res.headers().location).toContain("/formations");
});

test("le catalogue filtre les formations en direct", async ({ page }) => {
  await page.goto("/formations");
  const search = page.getByPlaceholder(/Rechercher par titre/);
  await search.fill("zzzz-introuvable");
  await expect(page.getByText("Aucune formation ne correspond")).toBeVisible();
  await page.getByRole("button", { name: /Afficher toutes les formations/ }).click();
  await expect(page.locator("article").first()).toBeVisible();
});

test("la recherche globale s’ouvre au clavier", async ({ page, isMobile }) => {
  test.skip(isMobile, "raccourci clavier");
  await page.goto("/");
  await page.keyboard.press("Control+k");
  await page.getByPlaceholder(/Rechercher une formation/).fill("web");
  await expect(page.getByRole("option").first()).toBeVisible();
});

test("SEO : robots, sitemap et manifeste", async ({ request }) => {
  expect((await request.get("/robots.txt")).status()).toBe(200);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/formations");
  expect((await request.get("/manifest.webmanifest")).status()).toBe(200);
});

test("en-têtes de sécurité présents", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  expect(res.headers()["x-frame-options"]).toBe("SAMEORIGIN");
  expect(res.headers()["x-powered-by"]).toBeUndefined();
});
