import { describe, expect, it } from "vitest";
import { detectDomain, excerpt, formatBytes, formatPrice, initials, mediaUrl, safeLocalRedirect, slugify, splitList, uploadedImage } from "@/lib/utils";

describe("excerpt", () => {
  it("retire les balises et normalise les espaces", () => {
    expect(excerpt("<p>Bonjour   <b>le</b>\nmonde</p>")).toBe("Bonjour le monde");
  });
  it("coupe proprement à la fin d’une phrase ou d’un mot", () => {
    const text = "Première phrase assez longue pour tester. Deuxième phrase qui dépasse largement la limite fixée ici.";
    expect(excerpt(text, 60)).toBe("Première phrase assez longue pour tester.");
    expect(excerpt("mot ".repeat(40), 30).endsWith("…")).toBe(true);
  });
});

describe("splitList", () => {
  it("découpe sur virgules, points-virgules et retours à la ligne, sans doublons", () => {
    expect(splitList("A, B;C\nA\n\n D ")).toEqual(["A", "B", "C", "D"]);
  });
});

describe("detectDomain", () => {
  it("classe les formations par domaine", () => {
    expect(detectDomain("Développement web moderne").slug).toBe("developpement");
    expect(detectDomain("Marketing digital et réseaux sociaux").slug).toBe("marketing-communication");
    expect(detectDomain("Analyse de données avec Power BI").slug).toBe("data-numerique");
    expect(detectDomain("Bureautique : Word et Excel").slug).toBe("bureautique-gestion");
    expect(detectDomain("Cuisine").slug).toBe("competences-pro");
  });
});

describe("chemins et redirections", () => {
  it("refuse les redirections externes ou ambiguës", () => {
    expect(safeLocalRedirect("/formations")).toBe("/formations");
    expect(safeLocalRedirect("//evil.com")).toBe("/");
    expect(safeLocalRedirect("https://evil.com")).toBe("/");
    expect(safeLocalRedirect("/\\evil.com")).toBe("/");
  });
  it("n’expose que les médias autorisés", () => {
    expect(mediaUrl("uploads/actualites/a.jpg")).toBe("/uploads/actualites/a.jpg");
    expect(mediaUrl("../../etc/passwd")).toBe("/images/formations/default.jpg");
    expect(uploadedImage("images/formations/old.jpg")).toBeNull();
    expect(uploadedImage("uploads/formations/new.webp")).toBe("/uploads/formations/new.webp");
  });
});

describe("formats", () => {
  it("formate prix, tailles, initiales et slugs", () => {
    expect(formatPrice(0)).toBe("Gratuit");
    expect(formatPrice("120.00")).toMatch(/120/);
    expect(formatBytes(0)).toBe("Taille inconnue");
    expect(formatBytes(1536)).toMatch(/1,5\s?Ko/);
    expect(initials("Grace Kabila Ilunga")).toBe("GK");
    expect(slugify("Développement & Création !")).toBe("developpement-creation");
  });
});
