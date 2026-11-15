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


test("le menu mobile s'ouvre au-dessus du site et chaque entrée mène à sa page", async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto("/");
  const trigger = page.locator('button[aria-controls="mobile-drawer"]');
  await expect(trigger).toBeVisible();
  await trigger.click();
  await expect(page.locator("#mobile-drawer")).toBeVisible();
  await expect(page.locator("#mobile-drawer")).toHaveAttribute("data-state","open");
  await page.locator('#mobile-drawer a[href="/logiciels"]').click();
  await expect(page).toHaveURL(/\/logiciels$/);
  await expect(page.locator("#mobile-drawer")).toHaveCount(0);
  await trigger.click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#mobile-drawer")).toHaveCount(0);
});

test("les liens principaux sont accessibles directement au clavier sur ordinateur", async ({page,isMobile}) => {
  test.skip(isMobile, "Navigation desktop uniquement");
  await page.goto("/");
  const nav = page.getByRole("navigation",{name:"Menu principal"});
  await expect(nav.getByRole("link",{name:"Formations",exact:true})).toBeVisible();
  await expect(nav.getByRole("link",{name:"Logiciels",exact:true})).toBeVisible();
  await nav.locator('a[href="/projets"]').click();
  await expect(page).toHaveURL(/\/projets$/);
});

test("le formulaire de contact conserve le sujet transmis depuis SCOLIA Pro", async ({page}) => {
  await page.goto("/contact?sujet=SCOLIA%20Pro");
  await expect(page.locator("#sujet")).toHaveValue("SCOLIA Pro");
});

test("la nouvelle direction graphique reste lisible et sans débordement", async ({page}, testInfo) => {
  test.setTimeout(90000);
  for (const [label,width,height] of [
    ["compact",320,700],["mobile",390,844],["tablette",820,1024],["desktop",1440,900]
  ] as const) {
    await page.setViewportSize({width,height});
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("compétences");
    await expect(page.locator(".jp-guide-row")).toHaveCount(4);
    await expect(page.locator(".jp-area-link")).toHaveCount(3);
    const widths = await page.evaluate(() => ({page: document.documentElement.scrollWidth,viewport:window.innerWidth}));
    expect(widths.page, "Débordement d'affichage "+label).toBeLessThanOrEqual(widths.viewport+1);
    if (label === "mobile" || label === "desktop") {
      await testInfo.attach("jp-services-accueil-"+label,{body:await page.screenshot({fullPage:true}), contentType:"image/png"});
    }
  }
});

test("les liens internes visibles sur les rubriques publiques ne retournent pas 404",async ({page,request,isMobile}) => {
  test.skip(isMobile, "Le même test couvre la navigation HTML sur ordinateur");
  test.setTimeout(150000);
  const hrefs = new Set<string>();
  for(const path of ["/","/formations","/formations-en-ligne","/logiciels","/scolia","/projets","/forum","/actualites","/a-propos","/contact","/partenariat","/aide"]) {
    const response = await page.goto(path);
    expect(response?.status(), "Rubrique "+path).toBe(200);
    for (const href of await page.locator('a[href^="/"]').evaluateAll(anchors =>
      anchors.map(a => a.getAttribute("href") || "").filter(Boolean))) {
      // Les téléchargements modifient des statistiques : pas de GET automatisé en audit.
      if (!href.startsWith("/telecharger/") && !href.startsWith("/uploads/")) hrefs.add(href.split("#")[0]!);
    }
  }
  for(const href of hrefs) {
    const response = await request.get(href, {maxRedirects:0});
    expect(response.status(), "Lien invalide : "+href).toBeLessThan(400);
  }
});


test("le sélecteur de langue du pied de page ouvre un petit menu ancré, jamais un dialogue Android", async ({page}) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto("/");
  const trigger = page.getByTestId("footer-language-trigger");
  await trigger.scrollIntoViewIfNeeded();
  await expect(trigger).toBeVisible();
  await expect(page.locator("footer select")).toHaveCount(0);
  await trigger.click();

  const menu = page.getByTestId("footer-language-popover");
  await expect(menu).toBeVisible();
  await expect(menu.getByRole("menuitemradio")).toHaveCount(2);
  await expect(page.getByRole("dialog")).toHaveCount(0);

  const triggerBox = await trigger.boundingBox();
  const menuBox = await menu.boundingBox();
  expect(triggerBox).not.toBeNull();
  expect(menuBox).not.toBeNull();
  expect(menuBox!.y + menuBox!.height, "Le menu doit apparaître au-dessus du déclencheur").toBeLessThanOrEqual(triggerBox!.y + 4);
  const horizontalOverlap = Math.min(menuBox!.x + menuBox!.width, triggerBox!.x + triggerBox!.width) - Math.max(menuBox!.x, triggerBox!.x);
  expect(horizontalOverlap, "Le menu doit rester à la verticale du sélecteur même lorsque Radix évite le bord de l’écran").toBeGreaterThan(Math.min(80,triggerBox!.width*.55));
  expect(menuBox!.x).toBeGreaterThanOrEqual(0);
  expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(391);

  await page.keyboard.press("Escape");
  await expect(menu).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("le choix de langue se fait depuis le menu contextuel avec mise à jour de la page", async ({page}) => {
  await page.goto("/");
  const trigger=page.getByTestId("footer-language-trigger");
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await page.getByTestId("footer-language-popover").getByRole("menuitemradio",{name:/English/}).click();
  await expect(page.locator("html")).toHaveAttribute("lang","en");
  await expect(trigger).toContainText("English");
  await trigger.click();
  await page.getByTestId("footer-language-popover").getByRole("menuitemradio",{name:/Français/}).click();
  await expect(page.locator("html")).toHaveAttribute("lang","fr");
  await expect(trigger).toContainText("Français");
});
