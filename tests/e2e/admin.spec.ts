import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { expect, test as base, type Page } from "@playwright/test";
import { ADMIN, acceptCookies, login } from "./helpers";

/** Une seule connexion administrateur pour toute la suite (la connexion est limitée à 8 essais / 15 min). */
let shared: Page;
const test = base.extend<{ page: Page }>({ page: async ({}, provide) => provide(shared) });
test.describe.configure({ mode: "serial" });
base.beforeAll(async ({ browser }) => {
  shared = await (await browser.newContext({ locale: "fr-FR" })).newPage();
  await acceptCookies(shared);
  await login(shared, ADMIN.email, ADMIN.password);
  await shared.waitForURL(/\/admin/);
});
base.afterAll(async () => shared?.context().close());

test("toutes les rubriques de la console s’ouvrent", async ({ page }) => {
  for (const r of ["/admin", "/admin/utilisateurs", "/admin/formations", "/admin/horaires", "/admin/abonnements", "/admin/live", "/admin/logiciels", "/admin/actualites", "/admin/produits", "/admin/projets", "/admin/forum", "/admin/partenariats", "/admin/messages", "/admin/support", "/admin/newsletter", "/admin/equipe", "/admin/parametres", "/admin/sante", "/admin/journal"]) {
    const res = await page.goto(r);
    expect(res?.status(), r).toBe(200);
  }
});

test("publier une formation avec image puis la retrouver au catalogue", async ({ page }, info) => {
  const titre = `Formation test ${Date.now()}`;
  await mkdir(info.outputDir, { recursive: true });
  const png = path.join(info.outputDir, "cover.png");
  // PNG 1×1 valide
  await writeFile(png, Buffer.from("89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d4944415478da63f8cfc0f01f0005000201a5f4c1d50000000049454e44ae426082", "hex"));
  await page.goto("/admin/formations/nouvelle");
  await page.getByLabel("Titre de la formation").fill(titre);
  await page.getByLabel("Durée totale").fill("3 semaines");
  await page.getByLabel(/Tarif/).fill("45");
  await page.getByLabel("Description détaillée").fill("Description complète de la formation de test, suffisamment longue.");
  await page.getByLabel(/Programme/).fill("Module A\nModule B");
  await page.locator("#f-image").setInputFiles(png);
  await page.getByRole("button", { name: /Publier la formation/ }).click();
  await expect(page.getByText("La formation a été publiée.")).toBeVisible();
  await page.goto("/formations");
  await expect(page.getByRole("heading", { name: titre })).toBeVisible();
  // Cliquer sur le vrai lien contenu dans le titre, pas sur le bloc h3 qui le dépasse.
  await page.getByRole("heading", { name: titre }).getByRole("link", { name: titre }).click();
  await expect(page).toHaveURL(/\/formations\/\d+$/);
  await expect(page.getByRole("heading", { level: 1, name: titre })).toBeVisible();
  await page.setViewportSize({ width: 360, height: 780 });
  await expect(page.getByRole("navigation", { name: "Sections de la formation" })).toBeVisible();
  await expect(page.getByRole("complementary", { name: "Inscription à la formation" })).toBeVisible();
  const dims = await page.evaluate(() => ({ viewport: window.innerWidth, content: document.documentElement.scrollWidth }));
  expect(dims.content, "Fiche de formation : débordement mobile").toBeLessThanOrEqual(dims.viewport);
  await page.setViewportSize({ width: 1280, height: 800 });
});

test("modifier les paramètres du site met à jour le bandeau", async ({ page }) => {
  const texte = `Annonce de test ${Date.now()}`;
  await page.goto("/admin/parametres");
  await expect(page.getByRole("heading", { name: "Annonce" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Coordonnées" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Réseaux sociaux" })).toBeVisible();
  await page.getByLabel(/Texte du bandeau/).fill(texte);
  await page.getByRole("button", { name: /Enregistrer les paramètres/ }).click();
  await expect(page.getByText("Paramètres enregistrés.")).toBeVisible();
  await page.goto("/");
  await expect(page.getByText(texte)).toBeVisible();
});

test("le menu administrateur mobile est accessible et se ferme au clavier", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin");
  const trigger = page.getByRole("button", { name: "Ouvrir le menu d’administration" });
  await expect(trigger).toBeVisible();
  await trigger.click();
  const drawer = page.getByRole("dialog", { name: "Menu d’administration" });
  await expect(drawer).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).not.toBeVisible();
  await trigger.click();
  await drawer.locator('a[href="/admin/formations"]').click();
  await expect(page).toHaveURL(/\/admin\/formations$/);
  await expect(drawer).not.toBeVisible();
  await page.setViewportSize({ width: 1280, height: 800 });
});
