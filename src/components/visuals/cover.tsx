import { cn } from "@/lib/utils";

/**
 * Couverture générée (aucune photo), construite sur le motif de marque « marches » :
 * fond profond de la couleur du domaine, barres arrondies qui montent et point d’élan.
 * La composition varie de façon stable selon l’identifiant ; les barres montent au survol.
 */
const PALETTES: Record<string, [string, string, string]> = {
  developpement: ["#0b1230", "#2f5bff", "#9db4ff"],
  "data-numerique": ["#05221f", "#0f9f84", "#7ee7cf"],
  "marketing-communication": ["#2a0a10", "#ff4d3d", "#ffb39f"],
  "bureautique-gestion": ["#0a1f14", "#16a34a", "#a7f0c2"],
  "management-entrepreneuriat": ["#241503", "#d97706", "#fcd58a"],
  "competences-pro": ["#121216", "#71717a", "#e4e4e7"],
  logiciel: ["#0f0b26", "#7b4dff", "#cdbfff"],
  actualite: ["#0f1115", "#475569", "#cbd5e1"],
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
  const variant = h % 3;
  const motion = "transition-transform duration-700 ease-out-expo";
  let art: React.ReactNode;
  if (variant === 0) {
    // Marches verticales qui montent depuis le bas.
    const count = 3 + (h % 2);
    const w = 34;
    const gap = 14;
    const right = 400 - 40 - (h % 3) * 16;
    const start = right - count * w - (count - 1) * gap;
    const bars = Array.from({ length: count }, (_, i) => {
      const t = (i + 1) / count;
      const height = 60 + t * (150 + ((h >> (i * 3)) % 30));
      return { x: start + i * (w + gap), y: 274 - height, height };
    });
    const last = bars[bars.length - 1]!;
    art = (
      <>
        {bars.map((b, i) => (
          <rect key={i} x={b.x} y={b.y} width={w} height={b.height + 40} rx={w / 2} fill={i === bars.length - 1 ? c1 : c2} fillOpacity={i === bars.length - 1 ? 0.95 : 0.12 + (i / count) * 0.25} className={cn(motion, "group-hover:-translate-y-2")} style={{ transitionDelay: `${i * 50}ms` }} />
        ))}
        <circle cx={last.x + w + 22} cy={last.y + 12} r="11" fill={c2} className={cn(motion, "group-hover:-translate-y-3")} style={{ transitionDelay: `${count * 50}ms` }} />
      </>
    );
  } else if (variant === 1) {
    // Barres horizontales de longueur croissante : la progression, lue de haut en bas.
    const rows = 3;
    const len = [110, 170, 240].map((l, i) => l + ((h >> (i * 2)) % 30));
    art = (
      <>
        {len.map((l, i) => (
          <rect key={i} x={400 - l - 30} y={92 + i * 52} width={l + 60} height={32} rx={16} fill={i === rows - 1 ? c1 : c2} fillOpacity={i === rows - 1 ? 0.95 : 0.14 + i * 0.12} className={cn(motion, "group-hover:-translate-x-3")} style={{ transitionDelay: `${i * 60}ms` }} />
        ))}
        <circle cx={400 - len[2]! - 56} cy={92 + 2 * 52 + 16} r="11" fill={c2} className={cn(motion, "group-hover:-translate-x-5")} style={{ transitionDelay: "200ms" }} />
      </>
    );
  } else {
    // Le « J » de la marque, agrandi et recadré, avec son point d’élan.
    const x = 300 + (h % 40);
    art = (
      <>
        <rect x={x - 140} y={150} width={34} height={140} rx={17} fill={c2} fillOpacity="0.16" className={cn(motion, "group-hover:-translate-y-2")} />
        <rect x={x - 92} y={100} width={34} height={190} rx={17} fill={c2} fillOpacity="0.28" className={cn(motion, "group-hover:-translate-y-2")} style={{ transitionDelay: "60ms" }} />
        <path d={`M${x} 40V180a52 52 0 0 1-52 52`} fill="none" stroke={c1} strokeWidth="34" strokeLinecap="round" className={cn(motion, "group-hover:-translate-y-1.5")} style={{ transitionDelay: "120ms" }} />
        <circle cx={x + 52} cy={42} r="17" fill={c2} className={cn(motion, "group-hover:-translate-y-3")} style={{ transitionDelay: "180ms" }} />
      </>
    );
  }
  return (
    <div className={cn("relative isolate overflow-hidden", className)} style={{ background: `linear-gradient(160deg, ${c0} 0%, ${c0} 55%, color-mix(in srgb, ${c1} 35%, ${c0}) 100%)` }} aria-hidden>
      <svg className="absolute inset-0 size-full" preserveAspectRatio="xMaxYMax slice" viewBox="0 0 400 250">
        {art}
      </svg>
      {label || title ? (
        <div className={cn("relative flex h-full flex-col justify-between", compact ? "p-3" : "p-5")}>
          {label ? <span className="w-fit rounded-full bg-white/12 px-2.5 py-1 text-[11px] font-medium text-white/90 ring-1 ring-white/15 backdrop-blur">{label}</span> : <span />}
          {title ? <span className={cn("line-clamp-2 max-w-[60%] font-display font-semibold leading-tight tracking-tight text-white", compact ? "text-sm" : "text-xl")}>{title}</span> : null}
        </div>
      ) : null}
    </div>
  );
}

/** Pastille « application » générée pour les logiciels (initiales + couleur stable). */
export function AppTile({ name, className }: { name: string; className?: string }) {
  const tones = ["#2f5bff", "#0f9f84", "#ff4d3d", "#16a34a", "#d97706", "#7b4dff", "#0ea5e9", "#0b0d1a"];
  const color = tones[hash(name) % tones.length]!;
  const letters = name.replace(/[^A-Za-zÀ-ÿ0-9 ]/g, "").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join("") || "•";
  return (
    <span className={cn("relative inline-flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-xl font-display text-base font-semibold text-white", className)} style={{ background: color }} aria-hidden>
      <span className="relative">{letters}</span>
    </span>
  );
}
