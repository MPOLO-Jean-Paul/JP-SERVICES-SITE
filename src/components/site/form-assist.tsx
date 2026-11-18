"use client";
import { useEffect } from "react";

/**
 * Assistant de saisie commun à tous les formulaires du site.
 * - Avant l’envoi : message clair sous chaque champ incorrect, curseur placé sur le premier.
 * - Pendant la saisie : l’erreur disparaît dès que le champ devient valide.
 * - Mots de passe : règle de robustesse et confirmation vérifiées en direct.
 * - Après l’envoi : le message du serveur (succès ou erreur) est amené à l’écran.
 * Le contrôle serveur reste la référence ; ceci ne fait qu’aider la personne.
 */
type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

const isField = (el: EventTarget | null): el is Field =>
  el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement;

function passwordProblem(field: Field): string {
  if (!(field instanceof HTMLInputElement) || field.type === "hidden") return "";
  const form = field.form;
  if (!form) return "";
  const main = form.querySelector<HTMLInputElement>('input[name="mot_de_passe"], input[name="nouveau_mot_de_passe"]');
  const confirm = form.querySelector<HTMLInputElement>('input[name="confirmer_mot_de_passe"]');
  if (!confirm || !main) return ""; // seulement à la création ou au changement de mot de passe
  if (field === main && field.value) {
    const v = field.value;
    if (v.length < 8 || !/[A-Z]/.test(v) || !/[a-z]/.test(v) || !/\d/.test(v)) return "8 caractères minimum, avec une majuscule, une minuscule et un chiffre.";
  }
  if (field === confirm && field.value && field.value !== main.value) return "Les deux mots de passe ne correspondent pas.";
  return "";
}

function messageFor(field: Field): string {
  const custom = passwordProblem(field);
  field.setCustomValidity?.(custom);
  const v = field.validity;
  if (v.valid) return "";
  if (custom) return custom;
  if (v.valueMissing) return field instanceof HTMLSelectElement ? "Choisissez une option." : "Ce champ est obligatoire.";
  if (v.typeMismatch && field instanceof HTMLInputElement && field.type === "email") return "Saisissez une adresse e-mail valide, par exemple nom@exemple.com.";
  if (v.typeMismatch && field instanceof HTMLInputElement && field.type === "url") return "Saisissez une adresse web complète, commençant par https://.";
  if (v.tooShort && "minLength" in field) return `Au moins ${field.minLength} caractères (${field.value.length} pour l’instant).`;
  if (v.tooLong && "maxLength" in field) return `${field.maxLength} caractères au maximum.`;
  if (v.rangeUnderflow || v.rangeOverflow) return "Cette valeur est en dehors des limites autorisées.";
  if (v.patternMismatch) return field.title || "Le format saisi n’est pas valide.";
  return field.validationMessage || "Vérifiez ce champ.";
}

/** Conteneur du champ (celui qui porte l’étiquette), pour placer l’erreur sous le champ complet. */
function fieldContainer(field: Field): HTMLElement | null {
  const label = field.id ? field.form?.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(field.id)}"]`) : null;
  if (label?.parentElement && label.parentElement.contains(field)) return label.parentElement;
  return field.closest<HTMLElement>(".jp-field-shell")?.parentElement ?? field.parentElement;
}

function errorSlot(field: Field): HTMLElement | null {
  const container = fieldContainer(field);
  if (!container) return null;
  let slot = container.querySelector<HTMLElement>(":scope > .jp-field-error");
  if (!slot) {
    slot = document.createElement("p");
    slot.className = "jp-field-error";
    slot.id = `${field.id || field.name}-erreur`;
    slot.setAttribute("aria-live", "polite");
    const hint = container.querySelector(":scope > .hint");
    container.insertBefore(slot, hint ?? null);
  }
  return slot;
}

function show(field: Field, rawMessage: string) {
  // Champ avec critères de robustesse affichés : la liste suffit, on marque seulement le champ.
  const message = rawMessage && field.dataset.strength !== undefined && field.validity.customError ? "Complétez les critères ci-dessous." : rawMessage;
  const slot = errorSlot(field);
  if (!slot) return;
  slot.textContent = message;
  slot.hidden = !message;
  field.setAttribute("aria-invalid", message ? "true" : "false");
  const described = new Set((field.getAttribute("aria-describedby") ?? "").split(" ").filter(Boolean));
  if (message) described.add(slot.id); else described.delete(slot.id);
  if (described.size) field.setAttribute("aria-describedby", [...described].join(" ")); else field.removeAttribute("aria-describedby");
  slot.parentElement?.classList.toggle("jp-field-has-error", Boolean(message));
}

export function FormAssist() {
  useEffect(() => {
    const touched = new WeakSet<Field>();

    const onSubmit = (event: Event) => {
      const form = event.target;
      if (!(form instanceof HTMLFormElement) || form.method === "get" || form.dataset.assist === "off") return;
      const fields = [...form.elements].filter(isField).filter((f) => !f.disabled && f.type !== "hidden" && !f.closest("[aria-hidden=true]") && f.offsetParent !== null);
      let first: Field | null = null;
      for (const field of fields) {
        touched.add(field);
        const message = messageFor(field);
        show(field, message);
        if (message && !first) first = field;
      }
      if (first) {
        event.preventDefault();
        event.stopImmediatePropagation();
        first.focus({ preventScroll: true });
        first.scrollIntoView({ block: "center", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      }
    };

    const onInput = (event: Event) => {
      const field = event.target;
      if (!isField(field)) return;
      const form = field.form;
      if (touched.has(field)) show(field, messageFor(field));
      // la confirmation suit les changements du mot de passe principal
      const confirm = form?.querySelector<HTMLInputElement>('input[name="confirmer_mot_de_passe"]');
      if (confirm && confirm !== field && touched.has(confirm)) show(confirm, messageFor(confirm));
    };

    const onBlur = (event: Event) => {
      const field = event.target;
      if (!isField(field) || !field.form || field.form.method === "get" || !field.value) return;
      touched.add(field);
      show(field, messageFor(field));
    };

    // Message du serveur apparu hors de l’écran : on l’amène à la vue.
    const observer = new MutationObserver((records) => {
      for (const r of records) for (const node of r.addedNodes) {
        if (!(node instanceof HTMLElement)) continue;
        const alert = node.matches('form [role="alert"], form [role="status"]') ? node : node.querySelector?.<HTMLElement>('form [role="alert"], form [role="status"]');
        if (!alert || alert.classList.contains("jp-field-error")) continue;
        const rect = alert.getBoundingClientRect();
        if (rect.top < 70 || rect.bottom > window.innerHeight) alert.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener("submit", onSubmit, true);
    document.addEventListener("input", onInput, true);
    document.addEventListener("change", onInput, true);
    document.addEventListener("blur", onBlur, true);
    return () => {
      observer.disconnect();
      window.removeEventListener("submit", onSubmit, true);
      document.removeEventListener("input", onInput, true);
      document.removeEventListener("change", onInput, true);
      document.removeEventListener("blur", onBlur, true);
    };
  }, []);
  return null;
}
