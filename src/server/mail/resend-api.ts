/**
 * Envoi transactionnel par HTTPS, compatible avec Render gratuit et Workers.
 * Les erreurs ne contiennent jamais le token ni le contenu des messages.
 */
type MailPayload = { to: string; subject: string; html: string; text: string; replyTo?: string };
type ResendConfig = { apiKey: string; from: string };

export async function sendResendEmail(
  config: ResendConfig,
  message: MailPayload,
  requester: typeof fetch = fetch,
): Promise<void> {
  if (!config.apiKey.trim() || !config.from.trim()) {
    throw new Error("Configuration de la messagerie HTTPS incomplète.");
  }
  const body = {
    from: config.from,
    to: [message.to],
    subject: message.subject,
    html: message.html,
    text: message.text,
    ...(message.replyTo ? { reply_to: message.replyTo } : {}),
  };
  const response = await requester("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`Échec de l'envoi HTTPS (HTTP ${response.status}).`);
  const result = (await response.json()) as { id?: string };
  if (!result.id) throw new Error("Le service de messagerie n'a pas confirmé l'envoi.");
}
