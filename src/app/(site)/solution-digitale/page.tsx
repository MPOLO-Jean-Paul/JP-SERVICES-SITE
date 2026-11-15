import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, CheckCircle2, Download, GraduationCap, MessagesSquare, Rocket, Video } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { getCurrentUser } from "@/server/auth/session";
import { pageMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = pageMetadata({ title: "La plateforme tout-en-un", description: "Votre élan numérique dans un même espace : formations, sessions en direct, ressources, programme personnel, projets et communauté JP-Services.", path: "/solution-digitale" });

export default async function SolutionPage() {
  const user = await getCurrentUser();
  const blocks = [
    { Icon: GraduationCap, t: "Formations", d: "Des parcours structurés, concrets et accessibles.", href: "/formations" },
    { Icon: Video, t: "En direct", d: "Des rendez-vous pour poser vos questions et pratiquer.", href: "/formations-en-ligne" },
    { Icon: Download, t: "Ressources", d: "Des outils numériques utiles, classés et vérifiés.", href: "/logiciels" },
    { Icon: CalendarCheck, t: "Mon programme", d: "Un repère personnel pour organiser votre progression.", href: user ? "/abonnements" : "/inscription" },
    { Icon: Rocket, t: "Projets", d: "Transformez ce que vous apprenez en réalisations.", href: "/projets" },
    { Icon: MessagesSquare, t: "Communauté", d: "Échangez avec des personnes qui avancent avec vous.", href: "/forum" },
  ];
  return (
    <>
      <section className="relative overflow-hidden border-b">
        <div className="bg-grid fade-mask absolute inset-0" aria-hidden />
        
        <div className="shell relative py-20 text-center lg:py-28">
          <span className="eyebrow">Plateforme tout-en-un</span>
          <h1 className="h-display reveal mx-auto mt-6 max-w-3xl">Votre élan numérique, dans un même espace.</h1>
          <p className="lead reveal mx-auto mt-6 max-w-2xl">Construisez des compétences utiles, accédez à des ressources sélectionnées et avancez avec une communauté qui partage vos ambitions.</p>
          <ul className="reveal mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-copy">{["À votre rythme", "Ressources vérifiées", "Accompagnement humain"].map((p) => <li key={p} className="inline-flex items-center gap-2"><CheckCircle2 className="size-4" /> {p}</li>)}</ul>
          <div className="reveal mt-8 flex flex-wrap justify-center gap-3"><Link href={user ? "/formations" : "/inscription"} className={buttonVariants({ variant: "dark", size: "xl" })}>{user ? "Explorer les formations" : "Créer mon espace gratuit"} <ArrowRight /></Link><Link href="/a-propos" className={buttonVariants({ variant: "outline", size: "xl" })}>Découvrir JP-Services</Link></div>
        </div>
      </section>
      <section className="section">
        <div className="shell">
          <SectionHeading align="center" kicker="Une plateforme conçue pour faire le lien" title="Un environnement simple pour passer de l’idée à l’action." text="Chaque espace est pensé pour vous aider à choisir, apprendre, essayer et partager sans multiplier les outils." />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{blocks.map(({ Icon, t, d, href }) => <Link key={t} href={href} className="card card-hover reveal group p-7"><span className="icon-box"><Icon /></span><h3 className="h3 mt-6">{t}</h3><p className="mt-2 text-copy">{d}</p><span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary">Ouvrir <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" /></span></Link>)}</div>
        </div>
      </section>
      <section className="section border-y bg-canvas-soft">
        <div className="shell grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="reveal"><span className="eyebrow">Progressez étape par étape</span><h2 className="h2 mt-2">Moins de dispersion. Plus de progression.</h2><p className="mt-4 text-lg text-copy">JP-Services rassemble les éléments essentiels de votre parcours dans une interface accueillante : contenus, outils, rendez-vous et échanges.</p></div>
          <ol className="reveal space-y-4">{["Choisissez votre voie selon votre besoin du moment.", "Apprenez, téléchargez, participez ou lancez un projet.", "La communauté et les échanges restent accessibles."].map((t, i) => <li key={t} className="card flex items-center gap-4 p-5"><span className="font-mono text-sm text-muted">0{i + 1}</span><p className="font-medium">{t}</p></li>)}</ol>
        </div>
      </section>
      <section className="section">
        <div className="shell"><div className="reveal relative overflow-hidden rounded-2xl bg-brand-950 p-10 text-center text-white sm:p-14"><div className="bg-grid pointer-events-none absolute inset-0 opacity-60 [--grid-line:rgb(255_255_255/0.05)]" aria-hidden /><h2 className="h2 relative text-white">Prêt à faire avancer votre prochain projet ?</h2><p className="relative mx-auto mt-3 max-w-xl text-white/70">Créez votre espace gratuit et retrouvez toutes les possibilités de JP-Services au même endroit.</p><Link href={user ? "/profil" : "/inscription"} className="relative mt-6 inline-flex h-12 items-center gap-2 rounded-lg bg-white px-6 font-medium text-brand-950 hover:bg-white/90">{user ? "Ouvrir mon espace" : "Créer mon compte"} <ArrowRight className="size-4" /></Link></div></div>
      </section>
    </>
  );
}
