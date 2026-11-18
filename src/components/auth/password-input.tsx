"use client";
import { useState } from "react";
import { Check, Eye, EyeOff, TriangleAlert } from "lucide-react";
import { Input } from "@/components/ui/form";

const RULES: Array<[string, (v: string) => boolean]> = [
  ["8 caractères minimum", (v) => v.length >= 8],
  ["Une majuscule", (v) => /[A-Z]/.test(v)],
  ["Une minuscule", (v) => /[a-z]/.test(v)],
  ["Un chiffre", (v) => /\d/.test(v)],
];

/**
 * Champ mot de passe : affichage du texte, alerte « majuscules activées » et, avec `strength`,
 * critères de robustesse vérifiés pendant la saisie.
 */
export function PasswordInput({ strength = false, onChange, onKeyUp, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { strength?: boolean }) {
  const [show, setShow] = useState(false);
  const [value, setValue] = useState(String(props.defaultValue ?? ""));
  const [caps, setCaps] = useState(false);
  const passed = RULES.filter(([, test]) => test(value)).length;
  const level = value ? passed : 0;
  return (
    <>
      <div className="relative">
        <Input
          {...props}
          data-strength={strength ? "" : undefined}
          type={show ? "text" : "password"}
          className="pr-14"
          onChange={(e) => { setValue(e.target.value); onChange?.(e); }}
          onKeyUp={(e) => { setCaps(e.getModifierState?.("CapsLock") ?? false); onKeyUp?.(e); }}
          onBlur={() => setCaps(false)}
        />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"} aria-pressed={show} className="jp-password-visibility absolute right-1.5 top-1/2 inline-flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-panel-2 hover:text-ink">
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {caps ? <p className="jp-caps-warning" role="status"><TriangleAlert aria-hidden className="size-3.5" />Les majuscules sont activées.</p> : null}
      {strength ? (
        <div className="jp-strength" data-level={level} aria-live="polite">
          <div className="jp-strength-bar" aria-hidden="true">{RULES.map((_, i) => <span key={i} data-on={i < level} />)}</div>
          <ul>
            {RULES.map(([label, test]) => {
              const ok = test(value);
              return <li key={label} data-ok={ok}><Check aria-hidden className="size-3.5" /><span>{label}</span><span className="sr-only">{ok ? " : respecté" : " : à compléter"}</span></li>;
            })}
          </ul>
        </div>
      ) : null}
    </>
  );
}
