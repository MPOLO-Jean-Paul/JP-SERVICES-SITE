"use server";
import { z } from "zod";
import { db, schema } from "@/server/db";
import { rateLimit } from "@/server/security/rate-limit";
import { clientIp } from "@/server/auth/session";
import { layoutEmail, sendMail } from "@/server/mail/mailer";
import { env } from "@/env";
import type { FormState } from "./contact";

import { PARTNERSHIP_TYPES } from "@/lib/constants";

const schemaInput = z.object({
  organisation: z.string().trim().min(2, "Indiquez votre organisation.").max(180),
  contact_nom: z.string().trim().min(2, "Indiquez le nom du contact.").max(160),
  email: z.string().trim().toLowerCase().email("L’adresse e-mail n’est pas valide.").max(190),
  telephone: z.string().trim().max(40).default(""),
  type_partenariat: z.enum(PARTNERSHIP_TYPES.map((t) => t.label) as [string, ...string[]], { message: "Choisissez un type de partenariat." }),
  message: z.string().trim().min(30, "Décrivez votre proposition en 30 caractères au moins.").max(8000, "Le message est trop long."),
});

export async function partnershipAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const raw = Object.fromEntries(["organisation", "contact_nom", "email", "telephone", "type_partenariat", "message"].map((k) => [k, String(formData.get(k) ?? "")]));
  if (formData.get("website")) return { status: "success", message: "Merci, votre demande a été transmise." };
  const parsed = schemaInput.safeParse(raw);
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Vérifiez le formulaire.", values: raw };
  if (!(await rateLimit(`partenariat:${await clientIp()}`, 4, 3600))) return { status: "error", message: "Trop de demandes envoyées. Réessayez plus tard.", values: raw };
  try {
    const d = parsed.data;
    await db.insert(schema.partenariatDemandes).values({ organisation: d.organisation, contactNom: d.contact_nom, email: d.email, telephone: d.telephone, typePartenariat: d.type_partenariat, message: d.message });
    const admin = env.ADMIN_NOTIFICATION_EMAIL ?? env.SMTP_FROM_ADDRESS;
    if (admin) {
      const mail = layoutEmail({ title: `Demande de partenariat : ${d.organisation}`, intro: `${d.contact_nom} (${d.email}${d.telephone ? ", " + d.telephone : ""}) — ${d.type_partenariat}\n\n${d.message}`, ctaLabel: "Voir les demandes", ctaUrl: `${env.APP_URL}/admin/partenariats` });
      await sendMail({ to: admin, subject: `[Partenariat] ${d.organisation}`, replyTo: d.email, ...mail }).catch(() => false);
    }
    return { status: "success", message: "Merci ! Votre demande de partenariat a bien été transmise. Nous vous recontactons rapidement." };
  } catch (error) {
    console.error("partenariat", error);
    return { status: "error", message: "La demande n’a pas pu être enregistrée. Réessayez.", values: raw };
  }
}
