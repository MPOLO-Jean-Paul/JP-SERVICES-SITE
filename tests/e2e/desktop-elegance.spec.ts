import { expect, test } from "@playwright/test";

/**
 * Régression de présentation : la feuille desktop ne doit provoquer
 * ni barre de défilement horizontale ni empilement du héros à >= 1024px.
 */
test("La vitrine desktop garde ses colonnes et tient dans le viewport", async ({ page }) => {
  for (const width of [1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto("/");
    expect(response?.ok(), `Accueil HTTP sur ${width}px`).toBeTruthy();

    await expect(page.locator("#home-title")).toBeVisible();
    await expect(page.locator(".jp-hero-art")).toBeVisible();

    const dimensions = await page.evaluate(() => {
      const text = document.querySelector(".jp-hero-main")!.getBoundingClientRect();
      const art = document.querySelector(".jp-hero-art")!.getBoundingClientRect();
      const sections = document.querySelectorAll(".jp-hsvc");
      return {
        pageWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
        textLeft: text.left,
        textRight: text.right,
        artLeft: art.left,
        artRight: art.right,
        textTop: text.top,
        artTop: art.top,
        serviceCount: sections.length,
      };
    });

    expect(dimensions.pageWidth, `Débordement horizontal à ${width}px`).toBeLessThanOrEqual(width + 1);
    expect(dimensions.artLeft, `Illustration trop à gauche à ${width}px`).toBeGreaterThan(dimensions.textLeft);
    expect(dimensions.artRight, `Illustration hors cadre à ${width}px`).toBeLessThanOrEqual(width + 1);
    expect(dimensions.serviceCount).toBeGreaterThan(0);
    expect(Math.abs(dimensions.textTop - dimensions.artTop)).toBeLessThan(250);
  }
});

test("La présentation mobile reste une liste tactile horizontale", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const display = await page.locator(".jp-hsvc-grid").evaluate((element) => getComputedStyle(element).display);
  expect(display).toBe("flex");
  const width = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(width).toBeLessThanOrEqual(391);
});
