import { expect, test } from "@playwright/test";

test("L'accueil reste lisible sans défilement horizontal", async ({ page }, testInfo) => {
  for (const [label, width, height] of [
    ["desktop", 1440, 900],
    ["tablet", 820, 1024],
    ["mobile", 390, 844],
    ["compact", 320, 640]
  ] as const) {
    await page.setViewportSize({ width, height });
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Des idées fortes");
    const metrics = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      windowWidth: window.innerWidth
    }));
    expect(metrics.scrollWidth, "Débordement à " + label).toBeLessThanOrEqual(metrics.windowWidth + 1);
    if (label === "desktop" || label === "mobile") {
      await testInfo.attach("accueil-" + label, {
        body: await page.screenshot({ fullPage: true }),
        contentType: "image/png"
      });
    }
  }
});

test("Menu mobile accessible et sans débordement sur les pages principales", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const menu = page.getByRole("button", { name: "Ouvrir le menu" });
  await menu.click();
  await expect(page.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: "Formations" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Ouvrir le menu" })).toHaveAttribute("aria-expanded", "false");
  for (const path of ["/services", "/formations", "/logiciels", "/projets", "/a-propos", "/contact"]) {
    await page.goto(path);
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);
    expect(scrollWidth, "Débordement sur " + path).toBeLessThanOrEqual(viewportWidth + 1);
  }
});

test("La recherche globale trouve un produit et transmet le filtre à sa page", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  const dialog = page.getByRole("dialog", { name: "Rechercher sur JP-SERVICES" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox", { name: "Rechercher sur toutes les rubriques" }).fill("SCOLIA");
  const result = dialog.getByRole("link", { name: /SCOLIA Pro/ });
  await expect(result).toBeVisible();
  await result.click();
  await expect(page).toHaveURL(/\/logiciels\?q=SCOLIA/);
  await expect(page.locator(".catalogue-card")).toHaveCount(1);
  const detail = page.locator(".catalogue-card details");
  await detail.locator("summary").click();
  await expect(detail).toHaveAttribute("open", "");
});

test("Le choix de thème est conservé après rechargement", async ({ page }) => {
  await page.goto("/");
  const before = await page.locator("html").getAttribute("data-theme");
  await page.locator(".theme-switch").click();
  const after = await page.locator("html").getAttribute("data-theme");
  expect(after).not.toBe(before);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", after || "light");
});

test("Le contact et les API ne prétendent pas enregistrer sans base", async ({ page, request }) => {
  await page.goto("/contact?subject=SCOLIA%20Pro");
  await expect(page.locator("#contact-subject")).toHaveValue("SCOLIA Pro");
  const health = await request.get("/api/health");
  expect(health.ok()).toBeTruthy();
  const body = await health.json();
  expect(body.status).toBe("ok");
  const malformed = await request.get("/api/search?q=x");
  expect(malformed.status()).toBe(400);
  const results = await request.get("/api/search?q=SCOLIA");
  expect(results.ok()).toBeTruthy();
  expect((await results.json()).source).toBe("preview");
});


test("L'administration est fermée sans configuration et n'expose pas de données", async ({ page, request }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto("/admin");
  await expect(page.getByRole("heading", {name:"Administration en préparation."})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
  for (const route of ["/api/admin/overview", "/api/admin/catalogue", "/api/admin/messages"]) {
    const response = await request.get(route);
    expect(response.status()).toBe(503);
    expect(response.headers()["cache-control"]).toContain("no-store");
  }
  const unauthorizedChange = await request.post("/api/admin/catalogue", {
    headers: {Origin:"https://example-attack.invalid","Content-Type":"application/json"},
    data: {}
  });
  expect(unauthorizedChange.status()).toBe(503);
  const meta = page.locator('meta[name="robots"]');
  await expect(meta).toHaveAttribute("content", /noindex/);
});


test("L'aperçu de la console est accessible sans aucune donnée privée", async ({page}, testInfo) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto("/admin");
  await page.getByRole("link",{name:/Voir la console en démonstration/}).click();
  await expect(page).toHaveURL(/\/admin\/demo$/);
  await expect(page.getByRole("status")).toContainText("données fictives");
  await page.getByRole("button",{name:/Catalogue/}).click();
  await expect(page.getByRole("heading",{name:"Catalogue éditorial"})).toBeVisible();
  await page.getByRole("button",{name:/Consulter/}).first().click();
  await expect(page.getByRole("region",{name:"Description de la fiche"})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
  await testInfo.attach("console-mobile-demo",{
    body:await page.screenshot({fullPage:true}),contentType:"image/png"
  });
});


test("La charte éditoriale conserve la palette de JP-SERVICES sur toutes les pages", async ({page}, testInfo) => {
  test.setTimeout(80000);
  for (const [label,width,height] of [
    ["compact",320,650],["mobile",390,844],["desktop",1440,900]
  ] as const) {
    await page.setViewportSize({width,height});
    for (const path of ["/","/formations","/services","/logiciels","/projets","/actualites","/a-propos","/contact","/admin/demo"]) {
      await page.goto(path);
      const dimensions = await page.evaluate(() => ({
        scroll:document.documentElement.scrollWidth,
        viewport:window.innerWidth
      }));
      expect(dimensions.scroll, label+" "+path).toBeLessThanOrEqual(dimensions.viewport + 1);
      await expect(page.locator(".editorial-header")).toBeVisible();
      await expect(page.locator(".editorial-footer")).toHaveCount(1);
      if (label === "desktop" && (path === "/" || path === "/formations")) {
        await testInfo.attach("nouvelle-charte-"+path.replace(/\W/g,"_")+"-desktop",{
          body:await page.screenshot({fullPage:true}),contentType:"image/png"
        });
      }
      if (label === "mobile" && (path === "/" || path === "/contact")) {
        await testInfo.attach("nouvelle-charte-"+path.replace(/\W/g,"_")+"-mobile",{
          body:await page.screenshot({fullPage:true}),contentType:"image/png"
        });
      }
    }
  }
});

test("L'identité officielle est cohérente dans la navigation et les contacts", async ({page}) => {
  await page.goto("/");
  await expect(page.locator(".editorial-footer-domain")).toContainText("jp-services.org");
  await expect(page.getByRole("link",{name:/contact@jp-services.org/})).toHaveCount(2);
  await page.goto("/contact");
  await expect(page.getByRole("link",{name:/contact@jp-services.org/})).toHaveCount(3);
  await expect(page.getByRole("heading",{level:1})).toContainText("Une question, un projet");
  await page.goto("/formations");
  await expect(page.getByRole("heading",{level:1})).toContainText("Développez des compétences");
  await expect(page.locator(".catalogue-card")).toHaveCount(3);
});


test("Les parcours de formation sont consultables, accessibles et lisibles à toutes les tailles", async ({page}, testInfo) => {
  test.setTimeout(90000);
  const slugs = [
    "developpement-applications",
    "bases-donnees-sql",
    "outils-numeriques-professionnels"
  ];
  for (const [width,height,label] of [
    [320,650,"compact"],[390,844,"mobile"],[820,1024,"tablette"],[1440,900,"desktop"]
  ] as const) {
    await page.setViewportSize({width,height});
    for (const slug of slugs) {
      const response = await page.goto("/formations/"+slug);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toBeVisible();
      await expect(page.getByText("Présentation indicative", {exact:false})).toBeVisible();
      await expect(page.locator(".course-module")).toHaveCount(4);
      await expect(page.locator(".course-module").first()).toHaveAttribute("open", "");
      await page.locator(".course-module summary").nth(1).click();
      await expect(page.locator(".course-module").nth(1)).toHaveAttribute("open", "");
      const layout = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        viewport: window.innerWidth
      }));
      expect(layout.width, "Débordement "+label+" "+slug).toBeLessThanOrEqual(layout.viewport + 1);
      if ((label==="mobile" || label==="desktop") && slug === "developpement-applications") {
        await testInfo.attach("formation-"+label, {
          body:await page.screenshot({fullPage:true}), contentType:"image/png"
        });
      }
    }
  }
});

test("Du catalogue à la fiche de formation puis au formulaire de contact", async ({page, request}) => {
  await page.goto("/formations");
  const programs = page.getByRole("link", {name:"Découvrir le parcours"});
  await expect(programs).toHaveCount(3);
  await programs.first().click();
  await expect(page).toHaveURL(/\/formations\/developpement-applications$/);
  await page.getByRole("link",{name:/Demander des renseignements/}).click();
  await expect(page).toHaveURL(/\/contact\?subject=/);
  await expect(page.locator("#contact-subject")).toHaveValue(/Développement d.applications/);
  const unknown = await request.get("/formations/programme-inconnu");
  expect(unknown.status()).toBe(404);
});

test("Les formations indicatives ne s'affichent pas comme offres certifiées", async ({page, request}) => {
  await page.goto("/formations/bases-donnees-sql");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content",/noindex/);
  await expect(page.getByText("Aucun certificat ni diplôme n'est annoncé",{exact:false})).toHaveCount(1);
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain("formations/developpement-applications");
  expect(xml).toContain("formations/bases-donnees-sql");
  expect(xml).toContain("formations/outils-numeriques-professionnels");
});
