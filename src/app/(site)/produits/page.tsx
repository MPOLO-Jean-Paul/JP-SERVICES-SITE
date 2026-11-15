import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShoppingBag } from "lucide-react";
import { PageHeader } from "@/components/site/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { buttonVariants } from "@/components/ui/button";
import { listProduits } from "@/server/services/content";
import { excerpt, formatPrice, uploadedImage } from "@/lib/utils";
import { Cover } from "@/components/visuals/cover";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({ title: "Produits", description: "Produits et prestations proposés par JP-Services.", path: "/produits" });

export default async function ProduitsPage() {
  const produits = await listProduits().catch(() => []);
  return (
    <>
      <PageHeader title="Produits et prestations" icon={ShoppingBag} text="Les produits, équipements et prestations proposés par JP-Services. Contactez-nous pour un devis personnalisé." />
      <section className="section"><div className="shell">
        {produits.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{produits.map((p) => <article key={p.id} className="card card-hover reveal overflow-hidden"><div className="relative aspect-[4/3]">{uploadedImage(p.imageUrl) ? <Image src={uploadedImage(p.imageUrl)!} alt="" fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover" /> : <Cover seed={p.id} palette="logiciel" label="Produit" className="absolute inset-0" />}</div><div className="p-6"><h2 className="h3">{p.nom}</h2><p className="mt-2 text-sm text-copy">{excerpt(p.description, 140)}</p><div className="mt-4 flex items-center justify-between"><strong className="text-lg">{formatPrice(p.prix)}</strong><Link href={`/contact?sujet=${encodeURIComponent("Produit : " + p.nom)}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">Demander <ArrowRight className="size-4" /></Link></div></div></article>)}</div>
        ) : <EmptyState icon={ShoppingBag} title="Aucun produit publié pour le moment" text="Découvrez nos formations et nos logiciels en attendant les prochaines offres." action={<Link href="/logiciels" className={buttonVariants()}>Voir les logiciels</Link>} />}
      </div></section>
    </>
  );
}
