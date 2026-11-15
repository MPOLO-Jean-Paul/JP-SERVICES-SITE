/**
 * Aperçus d’interface construits en code (aucune image) : ils illustrent les
 * fonctionnalités réelles de la plateforme avec la même typographie et les mêmes
 * composants que le site. Purement décoratifs (aria-hidden).
 */
import { ArrowDownToLine, BarChart3, BookOpen, CalendarDays, Check, CheckCheck, CircleDot, FileText, FolderKanban, Home, LayoutGrid, MessageSquare, Mic, MicOff, MonitorUp, PhoneOff, Receipt, Search, Users, Video, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function Window({ title, children, className, bar = true }: { title?: string; children: React.ReactNode; className?: string; bar?: boolean }) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-panel shadow-lg ring-1 ring-black/[0.02]", className)} aria-hidden>
      {bar ? (
        <div className="flex items-center gap-2 border-b bg-panel-2/60 px-4 py-2.5">
          <span className="flex gap-1.5">
            <i className="size-2.5 rounded-full bg-line-strong" />
            <i className="size-2.5 rounded-full bg-line-strong" />
            <i className="size-2.5 rounded-full bg-line-strong" />
          </span>
          {title ? <span className="mx-auto rounded-md border bg-panel px-3 py-0.5 font-mono text-[10px] text-muted">{title}</span> : null}
          <span className="w-10" />
        </div>
      ) : null}
      {children}
    </div>
  );
}

function Bar({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cn("block h-1.5 w-full overflow-hidden rounded-full bg-panel-2", className)}>
      <span className="block h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
    </span>
  );
}

function Initials({ text, tone = 0 }: { text: string; tone?: number }) {
  const tones = ["bg-brand-100 text-brand-800 dark:bg-brand-800/40 dark:text-brand-200", "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200", "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200", "bg-zinc-200 text-zinc-800 dark:bg-zinc-700 dark:text-zinc-100"];
  return <span className={cn("inline-flex size-7 items-center justify-center rounded-full text-[10px] font-semibold ring-2 ring-panel", tones[tone % tones.length])}>{text}</span>;
}

/** Tableau de bord apprenant (accueil). */
export function PlatformPreview({ className }: { className?: string }) {
  const nav = [Home, BookOpen, Video, ArrowDownToLine, FolderKanban, MessageSquare];
  return (
    <Window title="jp-services.org/espace" className={className}>
      <div className="grid grid-cols-[52px_1fr]">
        <div className="flex flex-col items-center gap-2 border-r py-4">
          {nav.map((I, i) => (
            <span key={i} className={cn("inline-flex size-8 items-center justify-center rounded-lg text-muted", i === 1 && "bg-primary-soft text-primary")}>
              <I className="size-4" />
            </span>
          ))}
        </div>
        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] text-muted font-medium">Mon espace</p>
              <p className="text-sm font-semibold">Bonjour, Grace</p>
            </div>
            <span className="flex h-8 items-center gap-2 rounded-lg border px-2.5 text-[11px] text-muted">
              <Search className="size-3.5" /> Rechercher <kbd className="rounded border px-1 font-mono text-[9px]">⌘K</kbd>
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1.35fr_1fr]">
            <div className="rounded-xl border p-4">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-muted font-medium">En cours</span>
                <span className="rounded-full bg-primary-soft px-2 py-0.5 font-medium text-primary">Module 3 / 5</span>
              </div>
              <p className="mt-2 text-sm font-semibold leading-snug">Développement web moderne</p>
              <div className="mt-3 flex items-center gap-3">
                <Bar value={64} />
                <span className="font-mono text-[11px] text-muted">64%</span>
              </div>
              <ul className="mt-3 space-y-1.5 text-[11px] text-copy">
                {["Bases du web et HTML", "Mise en page CSS", "JavaScript : fondamentaux"].map((m, i) => (
                  <li key={m} className="flex items-center gap-2">
                    <span className={cn("inline-flex size-4 items-center justify-center rounded-full border", i < 2 && "border-primary bg-primary text-white")}>{i < 2 ? <Check className="size-2.5" /> : null}</span>
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col rounded-xl border bg-brand-950 p-4 text-white">
              <span className="flex items-center gap-1.5 text-[11px] text-white/60 font-medium">
                <i className="size-1.5 animate-pulse-soft rounded-full bg-accent-500" /> En direct à 18:00
              </span>
              <p className="mt-2 text-sm font-semibold leading-snug">Atelier : créer sa première page web</p>
              <div className="mt-auto flex items-center justify-between pt-4">
                <span className="flex -space-x-2">
                  <Initials text="AM" />
                  <Initials text="JK" tone={1} />
                  <Initials text="ST" tone={2} />
                </span>
                <span className="rounded-md bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-950">Rejoindre</span>
              </div>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_1.2fr]">
            <div className="rounded-xl border p-4">
              <p className="text-[11px] text-muted font-medium">Heures cette semaine</p>
              <div className="mt-3 flex h-16 items-end gap-1.5">
                {[38, 62, 45, 80, 54, 92, 30].map((v, i) => (
                  <span key={i} className={cn("flex-1 rounded-sm", i === 5 ? "bg-primary" : "bg-panel-2")} style={{ height: `${v}%` }} />
                ))}
              </div>
              <div className="mt-1.5 flex justify-between font-mono text-[9px] text-muted">
                {["L", "M", "M", "J", "V", "S", "D"].map((d, i) => (
                  <span key={i}>{d}</span>
                ))}
              </div>
            </div>
            <div className="rounded-xl border p-4">
              <p className="text-[11px] text-muted font-medium">Ressources</p>
              <ul className="mt-2 divide-y text-[11px]">
                {[
                  ["Visual Studio Code", "Windows · macOS"],
                  ["SCOLIA Pro", "Windows 10/11"],
                  ["LibreOffice", "Multi-plateforme"],
                ].map(([n, p]) => (
                  <li key={n} className="flex items-center justify-between py-1.5">
                    <span>
                      <span className="block font-medium">{n}</span>
                      <span className="text-muted">{p}</span>
                    </span>
                    <ArrowDownToLine className="size-3.5 text-muted" />
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Window>
  );
}

/** Salle de visioconférence. */
export function LiveRoomPreview({ className }: { className?: string }) {
  const people = [["Formateur", "JP", 0], ["Aline", "AL", 1], ["Joël", "JO", 2], ["Merveille", "ME", 3], ["Patrick", "PA", 0], ["Ruth", "RU", 1]] as const;
  return (
    <Window bar={false} className={cn("bg-brand-950 text-white", className)}>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <span className="flex items-center gap-2 text-xs font-medium">
          <span className="flex items-center gap-1.5 rounded-full bg-accent-500 px-2 py-0.5 text-[11px] font-medium">
            <CircleDot className="size-3" /> Live
          </span>
          Atelier découverte — HTML & CSS
        </span>
        <span className="font-mono text-[10px] text-white/60">00:42:18</span>
      </div>
      <div className="grid grid-cols-3 gap-2 p-3">
        {people.map(([name, ini, tone], i) => (
          <div key={name} className={cn("relative flex aspect-video items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-white/10", i === 0 && "col-span-2 row-span-2 aspect-auto ring-brand-400/60")}>
            <span className={cn("inline-flex items-center justify-center rounded-full font-semibold", i === 0 ? "size-16 bg-brand-600 text-lg" : "size-8 text-[10px]", i !== 0 && ["bg-white/15", "bg-emerald-500/30", "bg-orange-500/30", "bg-sky-500/30"][tone])}>{ini}</span>
            <span className="absolute bottom-1.5 left-2 flex items-center gap-1 text-[10px] text-white/80">
              {i === 0 ? <Mic className="size-3" /> : <MicOff className="size-3 text-white/50" />} {name}
            </span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-center gap-2 border-t border-white/10 px-4 py-3">
        {[MicOff, Video, MonitorUp, MessageSquare].map((I, i) => (
          <span key={i} className="inline-flex size-9 items-center justify-center rounded-full bg-white/10">
            <I className="size-4" />
          </span>
        ))}
        <span className="inline-flex size-9 items-center justify-center rounded-full bg-accent-500">
          <PhoneOff className="size-4" />
        </span>
      </div>
    </Window>
  );
}

/** Médiathèque de logiciels. */
export function DownloadsPreview({ className, total }: { className?: string; total?: number }) {
  const rows = [
    ["SCOLIA Pro", "Gestion scolaire", "v1.2", "93 Mo", "#2b4ef0"],
    ["Visual Studio Code", "Développement", "v1.9x", "91 Mo", "#0ea5e9"],
    ["LibreOffice", "Bureautique", "v24.x", "334 Mo", "#16a34a"],
    ["GIMP", "Design et création", "v3.0", "320 Mo", "#d97706"],
  ];
  return (
    <Window title="Médiathèque" className={className}>
      <div className="flex items-center justify-between border-b px-4 py-3">
        <span className="flex items-center gap-2 text-xs text-muted">
          <Search className="size-3.5" /> Rechercher un logiciel…
        </span>
        <span className="font-mono text-[10px] text-muted">{total !== undefined ? `${total.toLocaleString("fr-FR")} téléchargements` : "Vérifiés par l’équipe"}</span>
      </div>
      <ul className="divide-y">
        {rows.map(([n, c, v, s, color], i) => (
          <li key={n} className="flex items-center gap-3 px-4 py-3">
            <span className="inline-flex size-9 items-center justify-center rounded-lg text-xs font-semibold text-white" style={{ background: color }}>
              {n!.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium">{n}</span>
              <span className="text-[11px] text-muted">
                {c} · {v} · {s}
              </span>
            </span>
            {i === 0 ? (
              <span className="flex w-24 flex-col gap-1">
                <Bar value={72} />
                <span className="text-right font-mono text-[9px] text-muted">72%</span>
              </span>
            ) : (
              <span className="inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] font-medium">
                <ArrowDownToLine className="size-3" /> Obtenir
              </span>
            )}
          </li>
        ))}
      </ul>
    </Window>
  );
}

/** Suivi d’un projet soumis. */
export function PipelinePreview({ className }: { className?: string }) {
  const steps = [
    ["Soumission", "Projet transmis à l’équipe", true],
    ["Analyse", "Faisabilité et besoins étudiés", true],
    ["Retour", "Décision et prochaines étapes", false],
  ] as const;
  return (
    <Window title="Suivi de projet" className={className}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] text-muted font-medium">Projet #0142</p>
            <p className="mt-1 text-sm font-semibold">Plateforme de suivi scolaire</p>
          </div>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">En analyse</span>
        </div>
        <ol className="mt-5 space-y-0">
          {steps.map(([t, d, done], i) => (
            <li key={t} className="relative flex gap-3 pb-5 last:pb-0">
              {i < steps.length - 1 ? <span className={cn("absolute left-[11px] top-6 h-[calc(100%-18px)] w-px", done ? "bg-primary" : "bg-line")} /> : null}
              <span className={cn("relative inline-flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px] font-semibold", done ? "border-primary bg-primary text-white" : "bg-panel text-muted")}>{done ? <Check className="size-3" /> : i + 1}</span>
              <span>
                <span className="block text-sm font-medium">{t}</span>
                <span className="text-xs text-muted">{d}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-5 rounded-lg border bg-panel-2/60 p-3 text-xs text-copy">
          <span className="font-semibold text-ink">Note de l’équipe :</span> le périmètre est clair, nous préparons une proposition de cadrage.
        </div>
      </div>
    </Window>
  );
}

/** Fil de discussion du forum. */
export function ThreadPreview({ className }: { className?: string }) {
  return (
    <Window title="Forum d’entraide" className={className}>
      <div className="space-y-4 p-5">
        <div>
          <p className="text-[11px] text-muted font-medium">Question · Excel</p>
          <p className="mt-1 text-sm font-semibold">Comment calculer un total par mois avec un tableau croisé ?</p>
        </div>
        {[
          ["AM", "Aline M.", "Insérez un tableau croisé dynamique, puis groupez la colonne Date par mois.", 0, 12],
          ["JP", "Formateur JP-Services", "Astuce : convertissez d’abord vos données en tableau (Ctrl+T) pour que le TCD se mette à jour.", 1, 24],
        ].map(([ini, name, text, tone, likes]) => (
          <div key={name as string} className="flex gap-3">
            <Initials text={ini as string} tone={tone as number} />
            <div className="min-w-0 flex-1 rounded-xl rounded-tl-sm border bg-panel-2/50 p-3">
              <p className="text-xs font-semibold">{name as string}</p>
              <p className="mt-1 text-xs text-copy">{text as string}</p>
              <p className="mt-2 flex gap-3 font-mono text-[10px] text-muted">
                <span>♥ {likes as number}</span>
                <span>Répondre</span>
              </p>
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 rounded-lg border px-3 py-2 text-xs text-muted">
          <MessageSquare className="size-3.5" /> Écrire une réponse…
        </div>
      </div>
    </Window>
  );
}

/** Demande de partenariat. */
export function PartnershipPreview({ className }: { className?: string }) {
  return (
    <Window title="Partenariats" className={className}>
      <div className="p-5">
        <div className="grid grid-cols-3 gap-2 text-center">
          {[["4", "Formats"], ["3", "Étapes"], ["48 h", "Premier retour"]].map(([v, l]) => (
            <div key={l} className="rounded-lg border p-3">
              <p className="font-display text-lg font-semibold">{v}</p>
              <p className="text-[11px] text-muted font-medium">{l}</p>
            </div>
          ))}
        </div>
        <ul className="mt-4 space-y-2">
          {[["Institut technique", "Formation et éducation", "Acceptée", "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"], ["Association jeunesse", "Communautaire", "En discussion", "bg-brand-100 text-brand-800 dark:bg-brand-800/40 dark:text-brand-200"], ["Entreprise locale", "Sponsoring et mécénat", "Nouvelle", "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100"]].map(([o, t, s, cls]) => (
            <li key={o} className="flex items-center justify-between rounded-lg border px-3 py-2.5">
              <span>
                <span className="block text-sm font-medium">{o}</span>
                <span className="text-[11px] text-muted">{t}</span>
              </span>
              <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", cls)}>{s}</span>
            </li>
          ))}
        </ul>
      </div>
    </Window>
  );
}

/** Logiciel SCOLIA Pro. */
export function ScoliaPreview({ className }: { className?: string }) {
  const nav = [["Accueil", LayoutGrid], ["Apprenants", Users], ["Encaisser", Wallet], ["Reçus", Receipt], ["Scolarité", BookOpen], ["Rapports", BarChart3]] as const;
  return (
    <Window title="SCOLIA Pro — Complexe scolaire" className={className}>
      <div className="grid grid-cols-[150px_1fr] text-[11px] max-sm:grid-cols-1">
        <div className="space-y-0.5 border-r p-3 max-sm:hidden">
          {nav.map(([l, I], i) => (
            <span key={l} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-copy", i === 0 && "bg-primary-soft font-medium text-primary")}>
              <I className="size-3.5" /> {l}
            </span>
          ))}
        </div>
        <div className="space-y-3 p-4">
          <div className="grid grid-cols-3 gap-2">
            {[["Encaissé (mois)", "4 820 000 FC", "+12%"], ["Recouvrement", "87 %", "+4 pts"], ["Apprenants", "642", "18 classes"]].map(([l, v, d]) => (
              <div key={l} className="rounded-lg border p-2.5">
                <p className="truncate text-muted">{l}</p>
                <p className="mt-1 font-display text-sm font-semibold">{v}</p>
                <p className="font-mono text-[9px] text-emerald-600">{d}</p>
              </div>
            ))}
          </div>
          <div className="rounded-lg border">
            <div className="flex items-center justify-between border-b px-3 py-2">
              <span className="font-medium">Journal des reçus</span>
              <span className="flex items-center gap-1 text-muted">
                <CalendarDays className="size-3" /> Novembre
              </span>
            </div>
            <table className="w-full">
              <tbody className="divide-y">
                {[["REC-000128", "6e A", "55 000 FC", "Payé"], ["REC-000127", "4e B", "110 000 FC", "Payé"], ["REC-000126", "2e C", "55 000 FC", "Annulé"], ["REC-000125", "1re A", "55 000 FC", "Payé"]].map(([n, c, m, s]) => (
                  <tr key={n}>
                    <td className="px-3 py-1.5 font-mono">{n}</td>
                    <td className="px-3 py-1.5 text-muted">{c}</td>
                    <td className="px-3 py-1.5 text-right font-medium">{m}</td>
                    <td className="px-3 py-1.5 text-right">
                      <span className={cn("rounded-full px-1.5 py-0.5 text-[9px] font-medium", s === "Payé" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200" : "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-100")}>{s}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 rounded-lg border bg-panel-2/50 px-3 py-2 text-copy">
            <CheckCheck className="size-3.5 text-emerald-600" /> Sauvegarde vérifiée aujourd’hui à 07:00 · journal d’audit intègre
          </div>
        </div>
      </div>
    </Window>
  );
}

/** Carte récapitulative d’un formulaire de contact. */
export function ContactPreview({ className }: { className?: string }) {
  return (
    <Window title="Nouveau message" className={className}>
      <div className="space-y-3 p-5 text-xs">
        {[["De", "Direction — Complexe scolaire"], ["Sujet", "Accompagnement digital"]].map(([k, v]) => (
          <div key={k} className="flex gap-3 border-b pb-2">
            <span className="w-12 text-muted">{k}</span>
            <span className="font-medium">{v}</span>
          </div>
        ))}
        <p className="leading-relaxed text-copy">Bonjour, nous souhaitons former notre secrétariat et équiper l’école d’un logiciel de gestion. Pouvez-vous nous proposer un accompagnement ?</p>
        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
          <Check className="size-3.5" /> Réponse de l’équipe sous 48 h ouvrées
        </div>
        <span className="flex items-center gap-2 text-muted">
          <FileText className="size-3.5" /> Demande enregistrée et suivie
        </span>
      </div>
    </Window>
  );
}
