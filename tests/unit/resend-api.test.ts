import { describe, expect, it, vi } from "vitest";
import { sendResendEmail } from "@/server/mail/resend-api";

const config = { apiKey: "test-secret-not-real", from: "JP-Services <contact@jp-services.org>" };
const mail = {
  to: "destinataire@exemple.test",
  subject: "Confirmation",
  html: "<p>Bonjour</p>",
  text: "Bonjour",
  replyTo: "reponse@exemple.test",
};

describe("messagerie HTTPS gratuite", () => {
  it("envoie les champs corrects par API HTTPS, sans SMTP", async () => {
    const fakeFetch = vi.fn(async () => new Response(JSON.stringify({ id: "test-123" }), { status: 200 }));
    await sendResendEmail(config, mail, fakeFetch as typeof fetch);
    expect(fakeFetch).toHaveBeenCalledTimes(1);
    const [url, options] = fakeFetch.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.resend.com/emails");
    expect(options.method).toBe("POST");
    expect((options.headers as Record<string,string>).Authorization).toBe("Bearer test-secret-not-real");
    expect(JSON.parse(String(options.body))).toMatchObject({
      from: config.from, to: [mail.to], reply_to: mail.replyTo, subject: mail.subject,
    });
  });

  it("rejette une erreur HTTP sans dévoiler le secret", async () => {
    const fakeFetch = vi.fn(async () => new Response('{"message":"private error"}', { status: 401 }));
    await expect(sendResendEmail(config, mail, fakeFetch as typeof fetch))
      .rejects.toThrow("Échec de l'envoi HTTPS (HTTP 401).");
  });

  it("refuse un succès sans identifiant de confirmation", async () => {
    const fakeFetch = vi.fn(async () => new Response("{}", { status: 200 }));
    await expect(sendResendEmail(config, mail, fakeFetch as typeof fetch))
      .rejects.toThrow("Le service de messagerie n'a pas confirmé l'envoi.");
  });
});
