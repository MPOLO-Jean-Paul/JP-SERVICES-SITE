import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Newspaper, PlayCircle } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { Cover } from "@/components/visuals/cover";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/ui/pagination";
import { countActualites, listActualites } from "@/server/services/content";
import { excerpt, formatDate, isImagePath, isVideoPath, mediaUrl } from "@/lib/utils";
import { pageMetadata } from "@/lib/seo";
import { buttonVariants } from "@/components/ui/button";
import { CtaBand } from "@/components/site/cta-band";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({ title: "Actualités", description: "Annonces, conseils et initiatives publiés par l’équipe JP-Services : formations, logiciels, projets et vie de la communauté.", path: "/actualites" });
const PER_PAGE = 9;

export default async function ActualitesPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const [total, items] = await Promise.all([countActualites().catch(() => 0), listActualites(PER_PAGE, (page - 1) * PER_PAGE).catch(() => [])]);
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));
  const [first, ...rest] = page === 1 ? items : [undefined, ...items];
  return (
    <>
      <PageHeader illustration="/illustrations/actualites-journal.svg" tone="amber" title="Actualités" icon={Newspaper} text="Des nouvelles utiles pour apprendre, créer et progresser : les annonces, conseils et initiatives publiés par l’équipe JP-Services." />
      <section className="section">
        <div className="shell">
          {!items.length ? (
            <EmptyState icon={Newspaper} title="Aucune actualité n’a été publiée pour le moment." text="Revenez bientôt ou consultez les formations et les projets déjà disponibles." action={<Link href="/formations" className={buttonVariants()}>Voir les formations</Link>} />
          ) : (
            <>
              {first ? (
                <article className="card reveal grid overflow-hidden lg:grid-cols-2">
                  <Link href={`/actualites/${first.id}`} className="relative block aspect-[16/10] bg-panel-2 lg:aspect-auto lg:min-h-[360px]">
                    {isImagePath(first.media) ? <Image src={mediaUrl(first.media)} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" priority /> : isVideoPath(first.media) ? <span className="absolute inset-0 flex items-center justify-center bg-brand-950 text-white"><PlayCircle className="size-16" /></span> : <Cover seed={first.id} palette="actualite" label="À la une" title={first.titre} className="absolute inset-0" />}
                  </Link>
                  <div className="flex flex-col justify-center p-8 lg:p-12">
                    <span className="eyebrow">À la une</span>
                    <time className="mt-3 text-sm text-muted" dateTime={first.datePublication.toISOString()}>{formatDate(first.datePublication)}</time>
                    <h2 className="h2 mt-2"><Link href={`/actualites/${first.id}`} className="hover:text-primary">{first.titre}</Link></h2>
                    <p className="mt-4 text-copy">{excerpt(first.contenu, 240)}</p>
                    <Link href={`/actualites/${first.id}`} className="mt-6 inline-flex items-center gap-2 font-semibold text-primary">Lire l’article <ArrowRight className="size-4" /></Link>
                  </div>
                </article>
              ) : null}
              <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {rest.filter(Boolean).map((a) => (
                  <article key={a!.id} className="card card-hover reveal group overflow-hidden">
                    <Link href={`/actualites/${a!.id}`} className="relative block aspect-[16/10] bg-panel-2">
                      {isImagePath(a!.media) ? <Image src={mediaUrl(a!.media)} alt="" fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" /> : isVideoPath(a!.media) ? <span className="absolute inset-0 flex items-center justify-center bg-brand-950 text-white"><PlayCircle className="size-12" /></span> : <Cover seed={a!.id} palette="actualite" label="Actualité" className="absolute inset-0" />}
                    </Link>
                    <div className="p-6">
                      <time className="text-xs font-medium text-muted" dateTime={a!.datePublication.toISOString()}>{formatDate(a!.datePublication)}</time>
                      <h3 className="h3 mt-2"><Link href={`/actualites/${a!.id}`} className="hover:text-primary">{a!.titre}</Link></h3>
                      <p className="mt-2 text-sm text-copy">{excerpt(a!.contenu, 130)}</p>
                      <Link href={`/actualites/${a!.id}`} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">Lire l’article <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></Link>
                    </div>
                  </article>
                ))}
              </div>
              <Pagination page={page} totalPages={totalPages} hrefFor={(p) => (p === 1 ? "/actualites" : `/actualites?page=${p}`)} />
            </>
          )}
        </div>
      </section>
      <CtaBand title="Ne manquez aucune nouveauté." text="Formations, sessions en direct et nouveaux services : créez votre compte pour être averti en premier." href="/inscription" label="Créer mon compte" secondary={{ href: "/services", label: "Nos services" }} />
    </>
  );
}
