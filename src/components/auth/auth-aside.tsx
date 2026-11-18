"use client";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Check, ShieldCheck } from "lucide-react";

/** Panneau gauche des pages de compte : un message et une illustration adaptés à chaque étape. */
type Aside = { kicker: string; title: string; text: string; image: string; points?: string[]; steps?: string[]; avatars?: boolean; note?: string };

const CONTENT: Record<"login" | "signup" | "recovery", Aside> = {
  login: {
    kicker: "Espace membre",
    title: "Heureux de vous revoir.",
    text: "Retrouvez en un instant tout ce qui concerne votre parcours chez JP-Services.",
    image: "/illustrations/apprendre-partout.svg",
    points: ["Vos formations et votre planning", "Vos notifications et sessions en direct", "Vos projets et le forum d’entraide"],
  },
  signup: {
    kicker: "Gratuit et sans engagement",
    title: "Rejoignez la communauté JP-Services.",
    text: "Un seul compte pour apprendre, suivre vos inscriptions et échanger avec d’autres passionnés du numérique.",
    image: "/illustrations/a-propos-equipe.svg",
    points: ["Inscription aux formations et suivi du planning", "Alertes dès l’ouverture de nouvelles sessions", "Accès au forum d’entraide et aux projets"],
    avatars: true,
  },
  recovery: {
    kicker: "Sécurité du compte",
    title: "Retrouvez l’accès en toute sécurité.",
    text: "Quelques secondes suffisent pour choisir un nouveau mot de passe.",
    image: "/illustrations/aide-questions.svg",
    steps: ["Indiquez l’adresse e-mail de votre compte", "Saisissez le code reçu par e-mail", "Choisissez un nouveau mot de passe"],
    note: "JP-Services ne vous demandera jamais votre mot de passe, par e-mail, téléphone ou messagerie.",
  },
};

function pick(pathname: string): Aside {
  if (pathname.startsWith("/inscription") || pathname.startsWith("/activation")) return CONTENT.signup;
  if (pathname.startsWith("/mot-de-passe")) return CONTENT.recovery;
  return CONTENT.login;
}

export function AuthAside({ badge, title }: { badge?: string; title?: string }) {
  const base = pick(usePathname());
  // Textes personnalisables depuis l’administration (page de connexion uniquement).
  const c = base === CONTENT.login ? { ...base, kicker: badge || base.kicker, title: title || base.title } : base;
  return (
    <div key={c.title} className="jp-auth-aside-body relative z-10 max-w-md">
      <p className="jp-auth-kicker">{c.kicker}</p>
      <h2 className="mt-5 text-[clamp(32px,3vw,46px)] font-semibold leading-[1.12] tracking-[-.045em] text-white">{c.title}</h2>
      <p className="mt-5 max-w-sm text-[15px] leading-7 text-[#c1cce0]">{c.text}</p>
      {c.points ? (
        <ul className="mt-7 grid gap-3">
          {c.points.map((p) => (
            <li key={p} className="flex items-center gap-3 text-[14.5px] text-white/85"><span className="jp-auth-check"><Check aria-hidden className="size-3.5" /></span>{p}</li>
          ))}
        </ul>
      ) : null}
      {c.steps ? (
        <ol className="mt-7 grid gap-3">
          {c.steps.map((s, i) => (
            <li key={s} className="flex items-center gap-3 text-[14.5px] text-white/85"><span className="jp-auth-step-dot">{i + 1}</span>{s}</li>
          ))}
        </ol>
      ) : null}
      {c.avatars ? (
        <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-3">
          <div className="flex shrink-0 -space-x-3" aria-hidden>
            {[1, 2, 3, 4, 5].map((n) => (
              <Image key={n} src={`/illustrations/avatar-${n}.svg`} width={44} height={44} alt="" unoptimized className="size-11 rounded-full ring-[3px] ring-[#0b1935]" />
            ))}
          </div>
          <p className="min-w-[180px] flex-1 text-[13px] leading-5 text-white/65">Apprenants, formateurs et porteurs de projets, à Lubumbashi et à distance.</p>
        </div>
      ) : null}
      <Image src={c.image} width={400} height={400} alt="" priority unoptimized className="jp-auth-illustration mt-9 h-auto w-[min(100%,240px)]" />
      {c.note ? <p className="mt-6 flex max-w-sm items-start gap-2 text-[12.5px] leading-5 text-white/55"><ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0" />{c.note}</p> : null}
    </div>
  );
}
