import Image from "next/image";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Compass } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { LogoMark } from "@/components/brand/logo";

export default async function NotFound() {
  const t = await getTranslations("common");
  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 text-center">
      <Link href="/" aria-label="JP-Services — Accueil" className="absolute left-6 top-6"><LogoMark className="size-10" /></Link>
      <Image src="/illustrations/page-introuvable.svg" width={400} height={400} alt="" priority unoptimized className="h-auto w-[min(70vw,280px)]" />
      <p className="relative mt-6 text-sm font-semibold uppercase tracking-[0.12em] text-primary">Erreur 404</p>
      <h1 className="h1 relative mt-3">{t("notFoundTitle")}</h1>
      <p className="relative mt-3 max-w-md text-copy">{t("notFoundText")}</p>
      <div className="relative mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className={buttonVariants({ variant: "dark" })}>
          {t("backHome")}
        </Link>
        <Link href="/formations" className={buttonVariants({ variant: "outline" })}>
          <Compass className="size-4" /> Formations
        </Link>
      </div>
    </main>
  );
}
