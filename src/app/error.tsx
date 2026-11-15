"use client";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="kicker">Erreur</p>
      <h1 className="h2 mt-2">Une erreur est survenue</h1>
      <p className="mt-3 max-w-md text-copy">Le service est momentanément indisponible. Vous pouvez réessayer ou revenir plus tard.</p>
      {error.digest ? <p className="mt-2 text-xs text-muted">Référence : {error.digest}</p> : null}
      <Button className="mt-6" onClick={reset}>
        Réessayer
      </Button>
    </main>
  );
}
