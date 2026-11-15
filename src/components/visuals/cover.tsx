import { cn } from "@/lib/utils";

/**
 * Couverture générée (aucune photo) : dégradé et motif déterminés par le domaine
 * et un identifiant, pour une identité cohérente et stable d’une page à l’autre.
 */
const PALETTES: Record<string, [string, string, string]> = {
  developpement: ["#0b1230", "#2b4ef0", "#93b0ff"],
  "data-numerique": ["#05221f", "#0f9f84", "#7ee7cf"],
  "marketing-communication": ["#2a0a10", "#e8432b", "#ffb39f"],
  "bureautique-gestion": ["#0a1f14", "#16a34a", "#a7f0c2"],
  "management-entrepreneuriat": ["#241503", "#d97706", "#fcd58a"],
  "competences-pro": ["#121216", "#52525b", "#d4d4d8"],
  logiciel: ["#0b0f1f", "#4f46e5", "#c7d2fe"],
  actualite: ["#0f1115", "#334155", "#cbd5e1"],
  live: ["#1a0a05", "#ff5c35", "#ffc2ae"],
};

function hash(input: string | number): number {
  const s = String(input);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

export function Cover({ seed, palette = "competences-pro", label, title, className, compact }: { seed: string | number; palette?: string; label?: string; title?: string; className?: string; compact?: boolean }) {
  const [c0, c1, c2] = PALETTES[palette] ?? PALETTES["competences-pro"]!;
  const h = hash(`${palette}-${seed}`);
  const variant = h % 4;
  const id = `cv-${palette}-${variant}-${h % 997}`;
  const angle = 110 + (h % 60);
  return (
    <div className={cn("relative isolate overflow-hidden", className)} style={{ background: `linear-gradient(${angle}deg, ${c0} 0%, ${c0} 35%, ${c1} 140%)` }} aria-hidden>
      <svg className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice" viewBox="0 0 400 250">
        <defs>
          <pattern id={`${id}-p`} width={variant === 1 ? 14 : 28} height={variant === 1 ? 14 : 28} patternUnits="userSpaceOnUse">
            {variant === 0 ? <path d="M28 0H0V28" fill="none" stroke={c2} strokeOpacity="0.14" strokeWidth="1" /> : null}
            {variant === 1 ? <circle cx="2" cy="2" r="1.1" fill={c2} fillOpacity="0.28" /> : null}
            {variant === 2 ? <path d="M0 28L28 0" stroke={c2} strokeOpacity="0.14" strokeWidth="1" /> : null}
            {variant === 3 ? <path d="M0 14h28" stroke={c2} strokeOpacity="0.12" strokeWidth="1" /> : null}
          </pattern>
          <radialGradient id={`${id}-g`} cx="0.85" cy="0.1" r="0.9">
            <stop offset="0" stopColor={c2} stopOpacity="0.5" />
            <stop offset="0.6" stopColor={c1} stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="400" height="250" fill={`url(#${id}-p)`} />
        <rect width="400" height="250" fill={`url(#${id}-g)`} />
        {variant % 2 === 0 ? (
          <g fill="none" stroke={c2} strokeOpacity="0.35">
            <circle cx={300 + (h % 60)} cy={180 - (h % 40)} r="70" />
            <circle cx={300 + (h % 60)} cy={180 - (h % 40)} r="110" strokeOpacity="0.18" />
          </g>
        ) : (
          <g fill={c2} fillOpacity="0.12">
            <rect x={250 + (h % 50)} y="40" width="120" height="120" rx="22" transform={`rotate(${h % 30} 310 100)`} />
          </g>
        )}
      </svg>
      {label || title ? (
        <div className={cn("relative flex h-full flex-col justify-between", compact ? "p-3" : "p-5")}>
          {label ? <span className="w-fit rounded-full bg-white/12 px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-white/90 ring-1 ring-white/15 backdrop-blur">{label}</span> : <span />}
          {title ? <span className={cn("line-clamp-2 max-w-[85%] font-display font-semibold leading-tight tracking-tight text-white", compact ? "text-sm" : "text-xl")}>{title}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Pastille « application » générée pour les logiciels (initiale + couleur stable). */
export function AppTile({ name, className }: { name: string; className?: string }) {
  const tones = ["#2b4ef0", "#0f9f84", "#e8432b", "#16a34a", "#d97706", "#4f46e5", "#0ea5e9", "#09090b"];
  const color = tones[hash(name) % tones.length]!;
  const letters = name.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "•";
  return (
    <span className={cn("relative inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl font-display text-base font-semibold text-white shadow-sm", className)} style={{ background: `linear-gradient(145deg, ${color}, ${color}cc)` }} aria-hidden>
      <span className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.22),transparent_55%)]" />
      <span className="relative">{letters}</span>
    </span>
  );
}
