import { expect, test } from "@playwright/test";
import { acceptCookies, forceActivationCode, login } from "./helpers";

test.describe.configure({ mode: "serial" });
const email = `membre.${Date.now()}@exemple.test`;
const password = "Membre-Test-2026";

test.beforeEach(async ({ page }) => acceptCookies(page));

test("inscription, activation et accès à l’espace membre", async ({ page }) => {
  await page.goto("/inscription");
  await page.locator("#prenom").fill("Aline");
  await page.locator("#nom").fill("Test");
  await page.getByLabel("Adresse e-mail").fill(email);
  await page.locator("#mot_de_passe").fill(password);
  await page.locator("#confirmer_mot_de_passe").fill(password);
  await page.getByRole("button", { name: /Créer mon compte/ }).click();
  await page.waitForURL(/\/activation/);
  const code = await forceActivationCode(email);
  await page.getByLabel(/Code d’activation/).fill(code);
  await page.getByRole("button", { name: /Activer mon compte/ }).click();
  await page.waitForURL(/\/profil/);
  await expect(page.locator("h1")).toContainText("Bonjour Aline");
});

test("mot de passe incorrect refusé", async ({ page }) => {
  await login(page, email, "Mauvais-Passe-2026");
  await expect(page.getByText("Identifiant ou mot de passe incorrect.")).toBeVisible();
});

test("inscription à une formation puis demande de planning", async ({ page }) => {
  await login(page, email, password);
  await page.waitForURL(/\/profil/);
  await page.goto("/formations");
  await page.locator("article a").first().click();
  await page.getByRole("button", { name: /S’inscrire à cette formation/ }).click();
  await expect(page.getByText("Vous êtes inscrit")).toBeVisible();
  await page.getByRole("link", { name: /Organiser mon programme/ }).click();
  await page.getByRole("button", { name: /^(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi)$/ }).first().click();
  await page.getByRole("button", { name: /Vérifier mon programme/ }).click();
  await expect(page.getByText("Dernière vérification")).toBeVisible();
  await page.getByRole("button", { name: /Confirmer et transmettre/ }).click();
  await expect(page.getByText(/bien été transmise/)).toBeVisible();
});

test("publication sur le forum, réponse et mention J’aime", async ({ page }) => {
  await login(page, email, password);
  await page.waitForURL(/\/profil/);
  await page.goto("/forum/nouveau");
  await page.getByLabel("Titre").fill("Question de test automatisé");
  await page.getByLabel("Contenu").fill("Ceci est une publication créée par le test de bout en bout du forum.");
  await page.getByRole("button", { name: "Publier" }).click();
  await page.waitForURL(/\/forum\/\d+$/);
  await page.getByPlaceholder("Écrivez votre réponse ici…").fill("Réponse automatique au sujet.");
  await page.getByRole("button", { name: /Publier la réponse/ }).click();
  await expect(page.getByText("Votre réponse a été publiée.")).toBeVisible();
  await page.getByRole("button", { name: /Aimer cette publication/ }).first().click();
  await expect(page.getByRole("button", { name: /Ne plus aimer/ }).first()).toBeVisible();
});

test("formulaire de contact", async ({ page }) => {
  await page.goto("/contact");
  await page.locator("#nom").fill("Visiteur Test");
  await page.locator("#email").fill("visiteur@exemple.test");
  await page.locator("#sujet").fill("Demande d’information");
  await page.locator("#message").fill("Bonjour, je souhaite des informations sur vos formations bureautiques.");
  await page.getByRole("button", { name: /Envoyer le message/ }).click();
  await expect(page.getByText(/bien été transmis/)).toBeVisible();
});

test("un membre ne peut pas accéder à l’administration", async ({ page }) => {
  await login(page, email, password);
  await page.waitForURL(/\/profil/);
  await page.goto("/admin");
  await expect(page).not.toHaveURL(/\/admin/);
});
