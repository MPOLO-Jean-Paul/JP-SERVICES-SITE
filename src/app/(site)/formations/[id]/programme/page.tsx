import type { Metadata } from "next";
import { Cover } from "@/components/visuals/cover";
import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { ArrowLeft, CheckCircle2, Clock3, LifeBuoy } from "lucide-react";
import { db, schema } from "@/server/db";
import { requireUser } from "@/server/auth/session";
import { getFormation } from "@/server/services/formations";
import { splitList } from "@/lib/utils";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PlanningForm } from "./planning-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Mon programme", robots: { index: false } };

const STATUS: Record<string, { label: string; tone: "warning" | "success" | "danger" | "neutral" }> = {
  brouillon: { label: "Brouillon", tone: "neutral" },
  en_attente: { label: "En attente de validation", tone: "warning" },
  valide: { label: "Planning validé", tone: "success" },
  refuse: { label: "À revoir", tone: "danger" },
};

export default async function ProgrammePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const formationId = Number(id);
  if (!Number.isInteger(formationId) || formationId <= 0) notFound();
  const user = await requireUser(`/formations/${formationId}/programme`);
  const formation = await getFormation(formationId);
  if (!formation) notFound();
  const enrolled = await db.select({ id: schema.inscriptions.id }).from(schema.inscriptions).where(and(eq(schema.inscriptions.userId, user.id), eq(schema.inscriptions.formationId, formationId))).limit(1);
  const existing = (await db.select().from(schema.planningValide).where(and(eq(schema.planningValide.userId, user.id), eq(schema.planningValide.formationId, formationId))).limit(1))[0];
  const modules = formation.modules.length ? formation.modules : ["Parcours complet"];
  const days = splitList(formation.joursPossibles).length ? splitList(formation.joursPossibles) : ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"];
  const defaultStart = formation.heureDebutDefaut?.slice(0, 5) || "08:00";
  const defaultEnd = formation.heureFinDefaut?.slice(0, 5) || "12:00";

  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div className="bg-grid fade-mask pointer-events-none absolute inset-0" aria-hidden />
        <div className="shell relative grid gap-8 py-14 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <Link href={`/formations/${formationId}`} className="inline-flex items-center gap-2 text-sm font-medium text-copy hover:text-ink">
              <ArrowLeft className="size-4" /> Retour à la formation
            </Link>
            <span className="eyebrow mt-6">Programme personnalisé</span>
            <h1 className="h1 mt-4">Organisez votre rythme d’apprentissage.</h1>
            <p className="mt-3 max-w-xl text-lg text-copy">Sélectionnez les modules souhaités et jusqu’à trois créneaux. L’équipe vérifiera ensuite la disponibilité du planning.</p>
          </div>
          <div className="card flex items-center gap-4 p-4 lg:w-96">
            <Cover seed={formation.id} palette={formation.domain.slug} className="aspect-[4/3] w-24 shrink-0 rounded-lg" />
            <div className="min-w-0">
              <span className="text-xs text-muted">Votre formation</span>
              <h2 className="truncate font-semibold">{formation.titre}</h2>
              <p className="text-sm text-copy">
                {formation.niveau || "Niveau ouvert"} · {formation.duree || "Durée à confirmer"}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          {sp.envoye ? (
            <Alert tone="success" className="mb-8">
              Votre demande de programme a bien été transmise. L’équipe JP-Services vous confirmera le planning.
            </Alert>
          ) : null}
          {!enrolled.length ? (
            <Alert tone="warning">
              Inscrivez-vous à la formation avant d’organiser votre programme.{" "}
              <Link href={`/formations/${formationId}`} className="font-semibold underline underline-offset-4">
                Ouvrir la fiche
              </Link>
            </Alert>
          ) : existing ? (
            <ExistingPlanning statut={existing.statut} modules={existing.modulesChoisis} horaires={existing.horaireDetails} dateCreation={existing.dateCreation} />
          ) : (
            <PlanningForm formationId={formationId} formationTitre={formation.titre} modules={modules} days={days} defaultStart={defaultStart} defaultEnd={defaultEnd} />
          )}
        </div>
      </section>
    </>
  );
}

function ExistingPlanning({ statut, modules, horaires, dateCreation }: { statut: string; modules: string; horaires: string; dateCreation: Date }) {
  let schedule: Record<string, { debut: string; fin: string }> = {};
  try {
    schedule = JSON.parse(horaires) as typeof schedule;
  } catch {}
  const s = STATUS[statut] ?? { label: statut, tone: "neutral" as const };
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="card p-8">
        <Badge tone={s.tone}>
          <Clock3 /> {s.label}
        </Badge>
        <h2 className="h2 mt-4">Votre demande de programme est enregistrée.</h2>
        <p className="mt-2 text-copy">Transmise le {dateCreation.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}. Les modifications restent gérées avec l’équipe pour éviter les conflits de planning.</p>
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="font-semibold">Modules choisis</h3>
            <ul className="mt-3 space-y-2">
              {modules
                .split(",")
                .map((m) => m.trim())
                .filter(Boolean)
                .map((m) => (
                  <li key={m} className="flex items-start gap-2 text-sm text-copy">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" /> {m}
                  </li>
                ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Disponibilités</h3>
            <ul className="mt-3 space-y-2">
              {Object.entries(schedule).map(([day, h]) => (
                <li key={day} className="flex items-center justify-between rounded-lg bg-panel-2 px-3 py-2 text-sm">
                  <span className="font-medium">{day}</span>
                  <span className="text-copy">
                    {h.debut} → {h.fin}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      <aside className="card h-fit p-6">
        <LifeBuoy className="size-6 text-primary" />
        <h3 className="h3 mt-3">Besoin d’un ajustement ?</h3>
        <p className="mt-2 text-sm text-copy">Contactez l’assistance en précisant la formation et les créneaux souhaités.</p>
        <Link href="/aide" className={buttonVariants({ variant: "outline", className: "mt-4 w-full" })}>
          Contacter l’assistance
        </Link>
      </aside>
    </div>
  );
}
