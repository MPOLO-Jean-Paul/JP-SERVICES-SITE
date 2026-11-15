"use client";

import { FormEvent, useEffect, useState } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";

type FormState = "idle" | "sending" | "success" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<FormState>("idle");
  const [feedback, setFeedback] = useState("");
  const [subject, setSubject] = useState("");

  useEffect(() => {
    const fromUrl = new URLSearchParams(window.location.search).get("subject");
    if (fromUrl) setSubject(fromUrl.slice(0, 180));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    setFeedback("");
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(data.entries()))
      });
      const payload: { message?: string } = await response.json();
      if (!response.ok) {
        setStatus("error");
        setFeedback(payload.message || "Envoi impossible. Veuillez réessayer.");
        return;
      }
      form.reset();
      setSubject("");
      setStatus("success");
      setFeedback(payload.message || "Message enregistré.");
    } catch {
      setStatus("error");
      setFeedback("Connexion interrompue. Vérifiez votre réseau et recommencez.");
    }
  }

  return <form className="contact-form" onSubmit={submit}>
    <div className="form-group"><label htmlFor="contact-name">Nom complet *</label><input id="contact-name" name="name" type="text" maxLength={120} autoComplete="name" placeholder="Votre nom" required/></div>
    <div className="form-group"><label htmlFor="contact-email">Adresse e-mail *</label><input id="contact-email" name="email" type="email" maxLength={254} autoComplete="email" placeholder="nom@entreprise.com" required/></div>
    <div className="form-group wide"><label htmlFor="contact-subject">Sujet *</label><input id="contact-subject" name="subject" type="text" maxLength={180} value={subject} onChange={event => setSubject(event.target.value)} placeholder="De quoi souhaitez-vous discuter ?" required/></div>
    <div className="form-group wide"><label htmlFor="contact-message">Votre message *</label><textarea id="contact-message" name="message" minLength={20} maxLength={5000} placeholder="Décrivez votre projet, vos objectifs et vos attentes…" required/></div>
    <div className="sr-only" aria-hidden="true"><label htmlFor="contact-website">Laissez ce champ vide</label><input id="contact-website" name="website" tabIndex={-1} autoComplete="off"/></div>
    <div className="form-group wide"><p className="form-note">Les champs marqués * sont obligatoires. Votre message est enregistré lorsque le service est configuré.</p><button type="submit" className="btn btn-primary" disabled={status==="sending"}>{status==="sending"?<><LoaderCircle size={18}/> Envoi en cours…</>:<>Envoyer le message <ArrowUpRight size={18}/></>}</button></div>
    {feedback && <div className={"form-feedback " + (status==="success"?"success":"error")} role="status" aria-live="polite">{feedback}</div>}
  </form>;
}
