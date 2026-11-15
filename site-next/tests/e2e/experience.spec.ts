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
