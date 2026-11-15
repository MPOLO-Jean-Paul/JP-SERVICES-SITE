import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Texte brut tronqué proprement (sans balises, espaces normalisés). */
export function excerpt(value: string | null | undefined, length = 150): string {
  const plain = (value ?? "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= length) return plain;
  const cut = plain.slice(0, length);
  const sentence = cut.lastIndexOf(". ");
  if (sentence > length * 0.6) return cut.slice(0, sentence + 1);
  const space = cut.lastIndexOf(" ");
  return (space > length * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,.;:]+$/u, "") + "…";
}

/** Découpe une liste séparée par virgules, points-virgules ou retours à la ligne. */
export function splitList(value: string | null | undefined, max = 30): string[] {
  const items = (value ?? "")
    .split(/\s*(?:\r\n|\r|\n|,|;)\s*/u)
    .map((s) => s.trim())
    .filter(Boolean);
  return Array.from(new Set(items)).slice(0, max);
}

export function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function formatPrice(value: string | number | null | undefined, locale = "fr"): string {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n) || n <= 0) return locale === "en" ? "Free" : "Gratuit";
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: Number.isInteger(n) ? 0 : 2,
  }).format(n);
}

export function formatDate(value: Date | string | null | undefined, locale = "fr", opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "long", year: "numeric" }): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value.length === 10 ? value + "T00:00:00" : value) : value;
  if (Number.isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "fr-FR", opts).format(d);
}

export function formatDateTime(value: Date | string | null | undefined, locale = "fr"): string {
  return formatDate(value, locale, { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function formatBytes(bytes: number | string | null | undefined, locale = "fr"): string {
  const n = Number(bytes ?? 0);
  if (!Number.isFinite(n) || n <= 0) return locale === "en" ? "Unknown size" : "Taille inconnue";
  const units = locale === "en" ? ["bytes", "KB", "MB", "GB"] : ["octets", "Ko", "Mo", "Go"];
  const power = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  const value = n / 1024 ** power;
  return `${power === 0 ? Math.round(value) : value.toLocaleString(locale === "en" ? "en-US" : "fr-FR", { maximumFractionDigits: 1 })} ${units[power]}`;
}

export function initials(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((p) => p.charAt(0).toUpperCase())
      .join("") || "?"
  );
}

/** Détection du domaine professionnel d'une formation à partir de son titre et de sa description. */
export type Domain = { slug: string; label: string; labelEn: string; icon: "code" | "chart" | "megaphone" | "table" | "briefcase" | "layers" };
const DOMAINS: Array<Domain & { keywords: string[] }> = [
  { slug: "marketing-communication", label: "Marketing & communication", labelEn: "Marketing & communication", icon: "megaphone", keywords: ["marketing", "communication", "reseaux sociaux", "community manager", "graphisme", "design", "canva", "video", "publicite"] },
  { slug: "developpement", label: "Développement web", labelEn: "Web development", icon: "code", keywords: ["developpement", "programmation", "javascript", "html", "css", "php", "wordpress", "site web", "python", "react", "next"] },
  { slug: "data-numerique", label: "Data & numérique", labelEn: "Data & digital", icon: "chart", keywords: ["data", "donnees", "sql", "power bi", "analyse", "informatique", "reseau informatique", "intelligence artificielle", "securite"] },
  { slug: "bureautique-gestion", label: "Bureautique & gestion", labelEn: "Office tools & management", icon: "table", keywords: ["bureautique", "excel", "word", "powerpoint", "office", "comptabilite", "secretariat", "gestion scolaire"] },
  { slug: "management-entrepreneuriat", label: "Management & entrepreneuriat", labelEn: "Management & entrepreneurship", icon: "briefcase", keywords: ["management", "entrepreneuriat", "leadership", "gestion de projet", "entreprise", "business"] },
];
export function detectDomain(titre: string, description?: string | null): Domain {
  const normalized = `${titre} ${description ?? ""}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
  for (const d of DOMAINS) {
    if (d.keywords.some((k) => normalized.includes(k))) {
      const { keywords: _k, ...rest } = d;
      void _k;
      return rest;
    }
  }
  return { slug: "competences-pro", label: "Compétences professionnelles", labelEn: "Professional skills", icon: "layers" };
}

/** Chemin public d'un média stocké (chemins relatifs historiques « images/… », « uploads/… », ou URL absolue). */
export function mediaUrl(path: string | null | undefined, fallback = "/images/formations/default.jpg"): string {
  const raw = (path ?? "").trim().replace(/\\/g, "/");
  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw)) return raw;
  const relative = raw.replace(/^\/+/, "");
  if (relative.includes("..") || !/^(?:images|uploads)\/[a-z0-9_.\/-]+$/i.test(relative)) return fallback;
  return "/" + relative;
}

/** Image téléversée via la nouvelle console (uploads/ ou URL absolue) ; null sinon (on affiche alors une couverture générée). */
export function uploadedImage(path: string | null | undefined): string | null {
  const raw = (path ?? "").trim().replace(/\\/g, "/");
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return raw;
  const rel = raw.replace(/^\/+/, "");
  if (!rel.startsWith("uploads/") || rel.includes("..")) return null;
  return "/" + rel;
}

export function isImagePath(path: string | null | undefined): boolean {
  return /\.(?:jpe?g|png|gif|webp|avif|svg)(?:\?.*)?$/i.test(path ?? "");
}

export function isVideoPath(path: string | null | undefined): boolean {
  return /\.(?:mp4|webm|ogg)(?:\?.*)?$/i.test(path ?? "");
}

export function safeLocalRedirect(candidate: string | null | undefined, fallback = "/"): string {
  const value = (candidate ?? "").trim();
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || /^\/[a-z]+:/i.test(value)) return fallback;
  return value;
}
