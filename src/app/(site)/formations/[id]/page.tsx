import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CalendarCheck, ChevronRight, Clock, Laptop, Plus, Signal, UserCheck, Users } from "lucide-react";
import { EnrollCard } from "@/components/formations/enroll-card";
import { getFormation, getRelatedFormations, getUserFormationState } from "@/server/services/formations";
import { getCurrentUser } from "@/server/auth/session";
import { excerpt, formatDate, formatPrice, uploadedImage } from "@/lib/utils";
import { Cover } from "@/components/visuals/cover";
import { jsonLd, pageMetadata, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

const DEFAULT_MODULES = ["Fondamentaux et prise en main", "Mise en pratique guidée", "Application sur un cas concret"];

async function load(idParam: string) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) return null;
  return getFormation(id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const f = await load((await params).id);
  if (!f) return { title: "Formation introuvable" };
  return pageMetadata({ title: f.titre, description: excerpt(f.description, 160), path: `/formations/${f.id}`, image: uploadedImage(f.image) ?? undefined });
}

export default async function FormationPage({ params }: { params: Promise<{ id: string }> }) {
  const f = await load((await params).id);
  if (!f) notFound();
  const user = await getCurrentUser();
  const [state, related] = await Promise.all([user ? getUserFormationState(user.id, f.id) : Promise.resolve({ isEnrolled: false, notificationsOn: false, planningStatus: null }), getRelatedFormations(f.id, 3).catch(() => [])]);
  const modules = f.modules.length ? f.modules : DEFAULT_MODULES;
  const price = Number(f.prix);
  const level = f.niveau?.trim() || "Niveau ouvert";
  const duration = f.duree?.trim() || "À confirmer";
  const startLabel = f.dateDebut ? formatDate(f.dateDebut) : "Date communiquée après inscription";

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({ "@type": "Course", name: f.titre, description: excerpt(f.description, 300), provider: { "@type": "Organization", name: "JP-Services", url: SITE_URL }, offers: { "@type": "Offer", price: price, priceCurrency: "USD", availability: "https://schema.org/InStock" }, hasCourseInstance: f.dateDebut ? { "@type": "CourseInstance", courseMode: "blended", startDate: f.dateDebut, location: { "@type": "Place", name: "JP-Services, Lubumbashi" } } : undefined })} />
      <section className="relative overflow-hidden border-b">
        <div className="bg-grid fade-mask pointer-events-none absolute inset-0" aria-hidden />
        
        <div className="shell relative grid gap-12 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-20">
          <div>
            <nav aria-label="Fil d’Ariane" className="flex items-center gap-1.5 text-[11px] text-muted font-medium">
              <Link href="/formations" className="hover:text-ink">Formations</Link>
              <ChevronRight className="size-3" />
              <span>{f.domain.label}</span>
            </nav>
            <h1 className="h1 mt-6">{f.titre}</h1>
            <p className="lead mt-5 max-w-2xl">{excerpt(f.description, 220)}</p>
            <dl className="mt-8 grid max-w-xl grid-cols-3 divide-x rounded-xl border bg-panel">
              {[
                [Signal, "Niveau", level],
                [Clock, "Durée", duration],
                [CalendarCheck, "Début", f.dateDebut ? formatDate(f.dateDebut, "fr", { day: "numeric", month: "short", year: "numeric" }) : "À annoncer"],
              ].map(([I, k, v]) => {
                const Ic = I as typeof Clock;
                return (
                  <div key={k as string} className="p-4">
                    <dt className="flex items-center gap-1.5 text-[11px] text-muted font-medium"><Ic className="size-3.5" /> {k as string}</dt>
                    <dd className="mt-1 text-sm font-semibold">{v as string}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
          <div className="relative">
            {uploadedImage(f.image) ? (
              <Image src={uploadedImage(f.image)!} alt={`Illustration de la formation ${f.titre}`} width={1200} height={800} className="aspect-[4/3] w-full rounded-2xl border object-cover shadow-lg" sizes="(min-width: 1024px) 40vw, 100vw" priority />
            ) : (
              <Cover seed={f.id} palette={f.domain.slug} label={f.domain.label} title={f.titre} className="aspect-[4/3] w-full rounded-2xl border shadow-lg" />
            )}
            <span className="pill absolute -bottom-4 left-6"><UserCheck className="size-3.5" /> Parcours accompagné</span>
          </div>
        </div>
      </section>

      <nav className="glass sticky top-16 z-30 border-b" aria-label="Sections de la formation">
        <div className="shell flex gap-6 overflow-x-auto text-sm font-medium no-scrollbar">
          {[
            ["#apercu", "Aperçu"],
            ["#competences", "Compétences"],
            ["#methode", "Méthode"],
            ["#programme", "Programme"],
          ].map(([href, label]) => (
            <a key={href} href={href} className="shrink-0 border-b border-transparent py-3.5 text-copy hover:border-ink hover:text-ink">
              {label}
            </a>
          ))}
        </div>
      </nav>

      <section className="section">
        <div className="shell grid gap-10 lg:grid-cols-[1fr_380px] lg:items-start">
          <div className="space-y-16">
            <section id="apercu" className="reveal scroll-mt-32">
              <span className="eyebrow">À propos de cette formation</span>
              <h2 className="h2 mt-2">Développez une compétence utile, avec un cadre clair.</h2>
              <div className="prose-jp mt-5 whitespace-pre-line text-lg">{f.description}</div>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {[
                  [Laptop, "Apprentissage concret", "Des notions expliquées puis appliquées progressivement."],
                  [Users, "Échanges facilités", "Un espace membre pour suivre vos formations et vos demandes."],
                  [CalendarCheck, "Organisation flexible", "Vous proposez jusqu’à trois disponibilités après inscription."],
                ].map(([I, title, text]) => {
                  const Ic = I as typeof Laptop;
                  return (
                    <div key={title as string} className="rounded-xl border bg-canvas-soft p-5">
                      <Ic className="size-5" />
                      <strong className="mt-3 block">{title as string}</strong>
                      <p className="mt-1 text-sm text-copy">{text as string}</p>
                    </div>
                  );
                })}
              </div>
            </section>

            <section id="competences" className="reveal scroll-mt-32">
              <span className="eyebrow">Compétences travaillées</span>
              <h2 className="h2 mt-2">Ce que vous allez parcourir.</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {modules.map((m, i) => (
                  <article key={m} className="card flex gap-4 p-5">
                    <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, "0")}</span>
                    <div>
                      <h3 className="font-semibold">{m}</h3>
                      <p className="mt-1 text-sm text-copy">Comprendre les notions essentielles, les pratiquer et savoir les mobiliser dans un contexte professionnel.</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section id="methode" className="reveal scroll-mt-32">
              <span className="eyebrow">Expérience d’apprentissage</span>
              <h2 className="h2 mt-2">Une progression en trois temps.</h2>
              <ol className="mt-6 grid gap-4 md:grid-cols-3">
                {[
                  ["Comprendre", "Vous découvrez les principes, le vocabulaire et les méthodes indispensables."],
                  ["Pratiquer", "Vous passez à l’action au moyen d’exercices, de démonstrations et de cas guidés."],
                  ["Consolider", "Vous réutilisez les acquis dans un travail de synthèse et identifiez vos prochaines étapes."],
                ].map(([title, text], i) => (
                  <li key={title} className="relative rounded-xl border p-5 pt-8">
                    <span className="absolute -top-3.5 left-5 inline-flex size-7 items-center justify-center rounded-full border bg-panel font-mono text-xs">{i + 1}</span>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-copy">{text}</p>
                  </li>
                ))}
              </ol>
            </section>

            <section id="programme" className="reveal scroll-mt-32">
              <span className="eyebrow">Programme</span>
              <h2 className="h2 mt-2">Les étapes de votre parcours.</h2>
              <div className="mt-6 divide-y rounded-xl border">
                {modules.map((m, i) => (
                  <details key={m} open={i === 0} className="group">
                    <summary className="flex cursor-pointer list-none items-center gap-4 p-5 [&::-webkit-details-marker]:hidden">
                      <span className="text-[11px] text-muted font-medium">Module {String(i + 1).padStart(2, "0")}</span>
                      <strong className="flex-1">{m}</strong>
                      <Plus className="size-4 text-muted transition-transform group-open:rotate-45" />
                    </summary>
                    <p className="px-5 pb-5 text-sm text-copy">Ce module combine compréhension, démonstration et mise en pratique. Le contenu détaillé et les supports sont communiqués dans votre espace de formation.</p>
                  </details>
                ))}
              </div>
            </section>
          </div>
          <EnrollCard formationId={f.id} priceLabel={formatPrice(price)} isFree={price <= 0} duration={duration} level={level} startLabel={startLabel} modulesCount={modules.length} user={Boolean(user)} state={state} />
        </div>
      </section>

      {related.length ? (
        <section className="section bg-canvas-soft">
          <div className="shell">
            <span className="eyebrow">À découvrir aussi</span>
            <h2 className="h2 mt-2">D’autres formations pour continuer.</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {related.map((r) => (
                <article key={r.id} className="card card-hover reveal overflow-hidden"><Cover seed={r.id} palette={r.domain.slug} className="h-24" /><div className="p-6">
                  <span className="text-[11px] text-muted font-medium">{r.domain.label}</span>
                  <h3 className="h3 mt-2">
                    <Link href={`/formations/${r.id}`} className="hover:text-primary">
                      {r.titre}
                    </Link>
                  </h3>
                  <p className="mt-2 text-sm text-copy">{excerpt(r.description, 110)}</p>
                  <div className="mt-4 flex items-center justify-between text-sm">
                    <span className="text-muted">
                      {r.niveau || "Niveau ouvert"} · {r.duree || "Durée à confirmer"}
                    </span>
                    <strong>{formatPrice(r.prix)}</strong>
                  </div>
                  <Link href={`/formations/${r.id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                    Voir la formation <ArrowRight className="size-4" />
                  </Link>
                </div></article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
