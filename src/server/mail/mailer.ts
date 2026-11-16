import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { env } from "@/env";
import { sendResendEmail } from "./resend-api";

export function smtpConfigurationError(): string | null {
  if (!env.SMTP_HOST) return "SMTP_HOST n'est pas défini.";
  if (!env.SMTP_FROM_ADDRESS) return "SMTP_FROM_ADDRESS n'est pas défini.";
  if (env.SMTP_USERNAME && !env.SMTP_PASSWORD) return "SMTP_PASSWORD est manquant alors que SMTP_USERNAME est défini.";
  return null;
}

export const smtpIsConfigured = () => smtpConfigurationError() === null;

let transporter: Transporter | null = null;
function getTransporter(): Transporter {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE || env.SMTP_PORT === 465,
    auth: env.SMTP_USERNAME ? { user: env.SMTP_USERNAME, pass: env.SMTP_PASSWORD } : undefined,
    connectionTimeout: 15_000,
    greetingTimeout: 15_000,
    socketTimeout: 20_000,
  });
  return transporter;
}

export type MailMessage = { to: string; subject: string; html: string; text: string; replyTo?: string };

/**
 * Envoie un e-mail transactionnel. Sans SMTP configuré (développement), le message est
 * journalisé dans la console et la fonction retourne `false` au lieu de lever une erreur.
 */
export async function sendMail(message: MailMessage): Promise<boolean> {
  // Render Free and Cloudflare Workers cannot rely on SMTP ports.
  // Prefer HTTPS API delivery whenever the provider is configured.
  if (env.RESEND_API_KEY && env.SMTP_FROM_ADDRESS) {
    await sendResendEmail(
      { apiKey: env.RESEND_API_KEY, from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_ADDRESS}>` },
      message,
    );
    return true;
  }
  if (!smtpIsConfigured()) {
    if (env.NODE_ENV !== "production") {
      console.info(`[mail:dev] → ${message.to}\nSujet : ${message.subject}\n${message.text}\n`);
    }
    return false;
  }
  await getTransporter().sendMail({
    from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_ADDRESS}>`,
    to: message.to,
    replyTo: message.replyTo,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
  return true;
}

export async function verifySmtp(): Promise<void> {
  await getTransporter().verify();
}

function escapeHtml(v: string) {
  return v.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string);
}

/** Gabarit HTML sobre et compatible avec les clients mail. */
export function layoutEmail(opts: { title: string; intro: string; code?: string; ctaLabel?: string; ctaUrl?: string; footer?: string }): { html: string; text: string } {
  const base = env.APP_URL.replace(/\/$/, "");
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#f4f5fb;font-family:Inter,Segoe UI,Arial,sans-serif;color:#1b1535">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="560" style="max-width:560px;background:#fff;border-radius:16px;border:1px solid #e6e4f3">
<tr><td style="padding:28px 32px 8px"><strong style="font-size:18px;color:#5b3df5">JP‑Services</strong></td></tr>
<tr><td style="padding:8px 32px"><h1 style="margin:0 0 12px;font-size:22px">${escapeHtml(opts.title)}</h1><p style="margin:0;font-size:15px;line-height:1.6;color:#4a4560">${escapeHtml(opts.intro)}</p></td></tr>
${opts.code ? `<tr><td style="padding:16px 32px"><div style="display:inline-block;font-size:30px;letter-spacing:8px;font-weight:700;background:#f1effc;color:#2b1e6b;padding:14px 22px;border-radius:12px">${escapeHtml(opts.code)}</div></td></tr>` : ""}
${opts.ctaUrl ? `<tr><td style="padding:12px 32px 20px"><a href="${escapeHtml(opts.ctaUrl)}" style="display:inline-block;background:#5b3df5;color:#fff;text-decoration:none;font-weight:600;padding:12px 22px;border-radius:10px">${escapeHtml(opts.ctaLabel ?? "Ouvrir")}</a></td></tr>` : ""}
<tr><td style="padding:12px 32px 28px;font-size:12px;color:#7a7590;line-height:1.6">${escapeHtml(opts.footer ?? "JP‑Services ne vous demandera jamais votre mot de passe. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.")}<br><a href="${base}" style="color:#5b3df5">${base}</a></td></tr>
</table></td></tr></table></body></html>`;
  const text = [opts.title, "", opts.intro, opts.code ? `\nCode : ${opts.code}` : "", opts.ctaUrl ? `\n${opts.ctaLabel ?? "Lien"} : ${opts.ctaUrl}` : "", "", opts.footer ?? "", base].join("\n");
  return { html, text };
}
