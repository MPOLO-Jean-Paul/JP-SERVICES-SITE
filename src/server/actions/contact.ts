"use server";
import { z } from "zod";
import { db, schema } from "@/server/db";
import { rateLimit } from "@/server/security/rate-limit";
import { clientIp } from "@/server/auth/session";
import { layoutEmail, sendMail } from "@/server/mail/mailer";
import { env } from "@/env";

export type FormState = { status: "idle" | "success" | "error"; message?: string; values?: Record<string, string> };

const contactSchema = z.object({
  nom: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  email: z.string().trim().toLowerCase().email("L’adresse e-mail n’est pas valide.").max(254),
  sujet: z.string().trim().min(3, "Indiquez un sujet.").max(180),
  message: z.string().trim().min(20, "Le message doit contenir au moins 20 caractères.").max(10_000, "Le message est trop long (10 000 caractères maximum)."),
});

export async function contactAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = { nom: String(formData.get("nom") ?? ""), email: String(formData.get("email") ?? ""), sujet: String(formData.get("sujet") ?? ""), message: String(formData.get("message") ?? "") };
  if (formData.get("website")) return { status: "success", message: "Votre message a bien été transmis." };
  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Vérifiez le formulaire.", values: raw };
  if (!(await rateLimit(`contact:${await clientIp()}`, 6, 3600))) return { status: "error", message: "Trop de messages ont été envoyés. Réessayez plus tard.", values: raw };
  try {
    await db.insert(schema.messages).values(parsed.data);
    const admin = env.ADMIN_NOTIFICATION_EMAIL ?? env.SMTP_FROM_ADDRESS;
    if (admin) {
      const mail = layoutEmail({ title: `Nouveau message : ${parsed.data.sujet}`, intro: `${parsed.data.nom} (${parsed.data.email}) a écrit :\n\n${parsed.data.message}`, ctaLabel: "Ouvrir la boîte de réception", ctaUrl: `${env.APP_URL}/admin/messages` });
      await sendMail({ to: admin, subject: `[Contact] ${parsed.data.sujet}`, replyTo: parsed.data.email, ...mail }).catch(() => false);
    }
    return { status: "success", message: "Votre message a bien été transmis. Notre équipe vous répondra rapidement." };
  } catch (error) {
    console.error("contact", error);
    return { status: "error", message: "Votre message n’a pas pu être enregistré. Veuillez réessayer.", values: raw };
  }
}

import { SUPPORT_SUBJECTS } from "@/lib/constants";

const supportSchema = z.object({
  nom: z.string().trim().min(2, "Indiquez votre nom.").max(120),
  email: z.string().trim().toLowerCase().email("L’adresse e-mail n’est pas valide.").max(254),
  sujet: z.enum(Object.keys(SUPPORT_SUBJECTS) as [string, ...string[]]).catch("Autre"),
  message: z.string().trim().min(20, "Décrivez le problème en 20 caractères au moins.").max(8000, "La description est trop longue (8 000 caractères maximum)."),
});

export async function supportAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = { nom: String(formData.get("nom") ?? ""), email: String(formData.get("email") ?? ""), sujet: String(formData.get("sujet") ?? "Connexion"), message: String(formData.get("message") ?? "") };
  if (formData.get("website")) return { status: "success", message: "Votre demande a bien été enregistrée." };
  const parsed = supportSchema.safeParse(raw);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Vérifiez le formulaire.", values: raw };
  if (!(await rateLimit(`support:${await clientIp()}`, 5, 3600))) return { status: "error", message: "Trop de demandes ont été envoyées. Réessayez dans une heure.", values: raw };
  try {
    await db.insert(schema.supportTickets).values({ nom: parsed.data.nom, email: parsed.data.email, sujet: SUPPORT_SUBJECTS[parsed.data.sujet] ?? "Autre demande", message: parsed.data.message });
    return { status: "success", message: "Votre demande a bien été enregistrée. Notre équipe reviendra vers vous rapidement." };
  } catch (error) {
    console.error("support", error);
    return { status: "error", message: "Votre demande n’a pas pu être enregistrée. Veuillez réessayer.", values: raw };
  }
}
