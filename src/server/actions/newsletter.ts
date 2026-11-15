"use server";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db, schema } from "@/server/db";
import { rateLimit } from "@/server/security/rate-limit";
import { clientIp } from "@/server/auth/session";
import { headers } from "next/headers";
import { createHmac } from "node:crypto";
import { env } from "@/env";

import { NEWSLETTER_THEMES, type NewsletterTheme } from "@/lib/constants";

export type NewsletterState = { status: "idle" | "success" | "error"; message?: string; prefsUrl?: string };

const schemaInput = z.object({ email: z.string().trim().toLowerCase().email().max(254), themes: z.array(z.enum(Object.keys(NEWSLETTER_THEMES) as [NewsletterTheme, ...NewsletterTheme[]])).default([]) });

export async function newsletterToken(email: string) {
  return createHmac("sha256", env.APP_SECRET).update(`newsletter:${email.toLowerCase().trim()}`).digest("hex").slice(0, 40);
}

export async function prefsUrlFor(email: string) {
  return `/newsletter/preferences?email=${encodeURIComponent(email)}&t=${await newsletterToken(email)}`;
}

export async function subscribeNewsletter(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const parsed = schemaInput.safeParse({ email: formData.get("email"), themes: formData.getAll("themes") });
  if (!parsed.success) return { status: "error", message: "Adresse e-mail invalide." };
  if (formData.get("website")) return { status: "success", message: "Merci, votre inscription est prise en compte." };
  const ip = await clientIp();
  if (!(await rateLimit(`newsletter:${ip}`, 6, 3600))) return { status: "error", message: "Trop de demandes. Réessayez plus tard." };
  const { email, themes } = parsed.data;
  const themesValue = (themes.length ? themes : Object.keys(NEWSLETTER_THEMES)).join(",");
  const ua = ((await headers()).get("user-agent") ?? "").slice(0, 255);
  try {
    await db
      .insert(schema.newsletterSubscribers)
      .values({ email, ipAddress: ip, userAgent: ua, statut: "actif", themes: themesValue })
      .onDuplicateKeyUpdate({ set: { statut: "actif", themes: themesValue, dateDesinscription: null } });
    return { status: "success", message: "Merci ! Vous recevrez nos prochaines nouvelles.", prefsUrl: await prefsUrlFor(email) };
  } catch (error) {
    console.error("newsletter", error);
    return { status: "error", message: "L’inscription n’a pas pu être enregistrée." };
  }
}

export async function updateNewsletterPrefs(_prev: NewsletterState, formData: FormData): Promise<NewsletterState> {
  const email = String(formData.get("email") ?? "").toLowerCase().trim();
  const token = String(formData.get("t") ?? "");
  if (!email || token !== (await newsletterToken(email))) return { status: "error", message: "Lien de préférences invalide." };
  const action = String(formData.get("action") ?? "save");
  const themes = formData.getAll("themes").map(String).filter((t) => t in NEWSLETTER_THEMES);
  try {
    if (action === "unsubscribe") {
      await db.update(schema.newsletterSubscribers).set({ statut: "desinscrit", dateDesinscription: new Date() }).where(eq(schema.newsletterSubscribers.email, email));
      return { status: "success", message: "Vous êtes désinscrit de la newsletter." };
    }
    await db
      .insert(schema.newsletterSubscribers)
      .values({ email, statut: "actif", themes: themes.join(",") })
      .onDuplicateKeyUpdate({ set: { statut: "actif", themes: themes.join(","), dateDesinscription: null } });
    return { status: "success", message: "Vos préférences sont enregistrées." };
  } catch (error) {
    console.error("newsletter prefs", error);
    return { status: "error", message: "Enregistrement impossible pour le moment." };
  }
}
