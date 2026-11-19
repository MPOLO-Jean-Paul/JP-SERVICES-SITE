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

test("Le nouvel en-tête desktop ne chevauche ni le menu ni les actions", async ({ page }) => {
  for (const width of [1280, 1366, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    const nav = page.locator('#site-header nav[aria-label="Menu principal"]');
    const logo = page.locator("#site-header .jp-site-logo");
    const actions = page.locator("#site-header .jp-header-actions");
    await expect(nav).toBeVisible();
    await expect(logo).toBeVisible();
    await expect(actions).toBeVisible();
    await expect(nav.locator("a.jp-nav-link")).toHaveCount(6);

    const sizes = await page.evaluate(() => {
      const nav = document.querySelector<HTMLElement>('#site-header nav[aria-label="Menu principal"]')!;
      const links = [...nav.querySelectorAll("a.jp-nav-link")];
      const actions = document.querySelector<HTMLElement>("#site-header .jp-header-actions")!;
      const logo = document.querySelector<HTMLElement>("#site-header .jp-site-logo")!;
      return {
        rightmostLink: Math.max(...links.map((link) => link.getBoundingClientRect().right)),
        leftmostLink: Math.min(...links.map((link) => link.getBoundingClientRect().left)),
        actionsLeft: actions.getBoundingClientRect().left,
        logoRight: logo.getBoundingClientRect().right,
        scrollWidth: document.documentElement.scrollWidth,
      };
    });
    expect(sizes.scrollWidth, `Débordement de l'en-tête à ${width}px`).toBeLessThanOrEqual(width + 1);
    expect(sizes.rightmostLink, `Menu collé aux actions à ${width}px`).toBeLessThanOrEqual(sizes.actionsLeft);
    expect(sizes.leftmostLink, `Menu collé au logo à ${width}px`).toBeGreaterThanOrEqual(sizes.logoRight);
  }
});

test("Les rubriques essentielles et le menu complet coexistent sur petits ordinateurs", async ({ page }) => {
  await page.setViewportSize({ width: 1100, height: 768 });
  await page.goto("/");
  const nav = page.locator('#site-header nav[aria-label="Menu principal"]');
  await expect(nav).toBeVisible();
  await expect(nav.locator("a.jp-nav-link").nth(0)).toBeVisible();
  await expect(nav.locator("a.jp-nav-link").nth(1)).toBeVisible();
  await expect(nav.locator("a.jp-nav-link").nth(2)).toBeHidden();
  await expect(page.locator('#site-header button[aria-controls="mobile-drawer"]')).toBeVisible();
  const viewportOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(viewportOverflow).toBe(false);

  // À 1024 px, ne garder que les deux entrées principales avec le tiroir complet.
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(nav.locator("a.jp-nav-link").nth(0)).toBeVisible();
  await expect(nav.locator("a.jp-nav-link").nth(1)).toBeVisible();
  await expect(nav.locator("a.jp-nav-link").nth(3)).toBeHidden();
  await expect(nav.locator("a.jp-nav-link").nth(4)).toBeHidden();
  await expect(page.locator('#site-header button[aria-controls="mobile-drawer"]')).toBeVisible();
  const narrowOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  expect(narrowOverflow).toBe(false);
});

test("La recherche devient lisible sur grand écran sans changer le mobile", async ({ page }) => {
  const search = page.locator("#site-header .jp-header-search-trigger");
  const label = search.locator(".jp-header-search-text");
  const kbd = search.locator(".jp-header-search-kbd");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(search).toBeVisible();
  await expect(label).toBeHidden();
  await expect(kbd).toBeHidden();

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(search).toBeVisible();
  await expect(label).toBeVisible();
  await expect(kbd).toBeHidden();

  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(label).toBeVisible();
  await expect(kbd).toBeVisible();

  await search.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(search).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toBeHidden();

  await page.keyboard.press("Control+k");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
});

test("L'en-tête reste collant sans mouvement ni débordement après le défilement", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const header = page.locator("#site-header");
  await expect(header).toBeVisible();
  await page.evaluate(() => window.scrollTo({ top: 850, behavior: "instant" }));
  await expect(header).toHaveAttribute("data-scrolled", "");
  const metrics = await header.evaluate((element) => {
    const bounds = element.getBoundingClientRect();
    return { top: bounds.top, width: bounds.width, viewport: window.innerWidth };
  });
  expect(metrics.top).toBeGreaterThanOrEqual(-1);
  expect(metrics.top).toBeLessThanOrEqual(1);
  expect(metrics.width).toBeLessThanOrEqual(metrics.viewport + 1);
});
