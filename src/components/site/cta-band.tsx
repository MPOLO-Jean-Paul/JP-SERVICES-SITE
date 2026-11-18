import Link from "next/link";
import { ArrowRight } from "lucide-react";

/** Bandeau d’appel final, identique sur toutes les rubriques. */
export function CtaBand({ title, text, href, label, secondary }: { title: string; text: string; href: string; label: string; secondary?: { href: string; label: string } }) {
  return (
    <section className="shell jp-svc-final-wrap">
      <div className="jp-service-band">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {secondary ? <Link href={secondary.href} className="jp-cta-band-ghost">{secondary.label}</Link> : null}
          <Link href={href} className="jp-action jp-action-light">{label} <ArrowRight aria-hidden className="size-4" /></Link>
        </div>
      </div>
    </section>
  );
}
