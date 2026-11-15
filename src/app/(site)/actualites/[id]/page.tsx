import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { ShareButtons } from "@/components/site/share-buttons";
import { getActualite, listActualites } from "@/server/services/content";
import { excerpt, formatDate, isImagePath, isVideoPath, mediaUrl } from "@/lib/utils";
import { jsonLd, pageMetadata, SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

async function load(id: string) {
  const n = Number(id);
  return Number.isInteger(n) && n > 0 ? getActualite(n) : null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const a = await load((await params).id);
  if (!a) return { title: "Article introuvable" };
  return pageMetadata({ title: a.titre, description: excerpt(a.contenu, 160), path: `/actualites/${a.id}`, image: isImagePath(a.media) ? mediaUrl(a.media) : undefined, type: "article", publishedTime: a.datePublication.toISOString() });
}

export default async function ArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const a = await load((await params).id);
  if (!a) notFound();
  const others = (await listActualites(4).catch(() => [])).filter((x) => x.id !== a.id).slice(0, 3);
  const paragraphs = a.contenu.split(/\n{2,}|\r\n\r\n/).map((p) => p.trim()).filter(Boolean);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd({ "@type": "NewsArticle", headline: a.titre, datePublished: a.datePublication.toISOString(), image: isImagePath(a.media) ? [`${SITE_URL}${mediaUrl(a.media)}`] : undefined, author: { "@type": "Organization", name: "JP-Services" }, publisher: { "@type": "Organization", name: "JP-Services", logo: { "@type": "ImageObject", url: `${SITE_URL}/icons/icon-512.png` } }, mainEntityOfPage: `${SITE_URL}/actualites/${a.id}` })} />
      <article>
        <header className="relative overflow-hidden border-b"><div className="bg-grid fade-mask pointer-events-none absolute inset-0" aria-hidden />
          <div className="shell-narrow relative py-14">
            <Link href="/actualites" className="inline-flex items-center gap-2 text-sm font-medium text-copy hover:text-ink"><ArrowLeft className="size-4" /> Toutes les actualités</Link>
            <h1 className="h1 mt-6">{a.titre}</h1>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-4 text-sm text-muted">
              <time dateTime={a.datePublication.toISOString()} className="inline-flex items-center gap-2"><CalendarDays className="size-4" /> {formatDate(a.datePublication)} · JP‑Services</time>
              <ShareButtons title={a.titre} path={`/actualites/${a.id}`} />
            </div>
          </div>
        </header>
        {a.media ? (
          <div className="shell-narrow -mt-0 py-8">
            {isImagePath(a.media) ? <Image src={mediaUrl(a.media)} alt="" width={1200} height={675} className="aspect-video w-full rounded-2xl object-cover shadow-md" priority sizes="(min-width: 768px) 768px, 100vw" /> : isVideoPath(a.media) ? <video controls preload="metadata" className="aspect-video w-full rounded-2xl bg-black shadow-md" src={mediaUrl(a.media)} /> : null}
          </div>
        ) : null}
        <div className="shell-narrow pb-16 pt-4">
          <div className="prose-jp text-lg">
            {paragraphs.map((p, i) => <p key={i} className="whitespace-pre-line">{p}</p>)}
          </div>
          <p className="mt-10 rounded-xl bg-panel-2 p-5 text-sm text-copy">Nos contenus sont préparés pour vous informer clairement sur nos activités, formations et opportunités. Pour toute question, <Link href="/contact" className="font-semibold text-primary">contactez l’équipe</Link>.</p>
        </div>
      </article>
      {others.length ? (
        <section className="section border-t bg-canvas-soft">
          <div className="shell">
            <div className="flex items-end justify-between gap-4">
              <div><span className="eyebrow">Continuer la lecture</span><h2 className="h2 mt-2">D’autres actualités</h2></div>
              <Link href="/actualites" className="inline-flex items-center gap-2 font-semibold text-primary">Tout voir <ArrowRight className="size-4" /></Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {others.map((o) => (
                <article key={o.id} className="card card-hover reveal p-6">
                  <time className="text-xs text-muted">{formatDate(o.datePublication)}</time>
                  <h3 className="h3 mt-2"><Link href={`/actualites/${o.id}`} className="hover:text-primary">{o.titre}</Link></h3>
                  <p className="mt-2 text-sm text-copy">{excerpt(o.contenu, 110)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
