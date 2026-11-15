"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
  interface Window { JitsiMeetExternalAPI?: new (domain: string, options: Record<string, unknown>) => { dispose: () => void; addListener: (e: string, fn: () => void) => void } }
}

export function JitsiRoom({ roomName, displayName, isHost, locale, subject }: { roomName: string; displayName: string; isHost: boolean; locale: string; subject: string }) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const [left, setLeft] = useState(false);
  useEffect(() => {
    if (!ready || !container.current || !window.JitsiMeetExternalAPI) return;
    const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
      roomName,
      parentNode: container.current,
      width: "100%",
      height: "100%",
      lang: locale,
      userInfo: { displayName },
      configOverwrite: { prejoinPageEnabled: true, startWithAudioMuted: true, startWithVideoMuted: !isHost, disableDeepLinking: true, enableWelcomePage: false, requireDisplayName: true, readOnlyName: Boolean(displayName), defaultLanguage: locale, subject },
      interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false, SHOW_BRAND_WATERMARK: false, MOBILE_APP_PROMO: false, TOOLBAR_ALWAYS_VISIBLE: false, DEFAULT_BACKGROUND: "#1b1535" },
    });
    api.addListener("readyToClose", () => setLeft(true));
    return () => api.dispose();
  }, [ready, roomName, displayName, isHost, locale, subject]);
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-brand-950 shadow-lg lg:aspect-[16/9]">
      <Script src="https://meet.jit.si/external_api.js" strategy="afterInteractive" onLoad={() => setReady(true)} onError={() => setFailed(true)} />
      <div ref={container} className="absolute inset-0" />
      {!ready && !failed ? <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/80"><Loader2 className="size-8 animate-spin" /><p className="text-sm">Préparation de la salle…</p></div> : null}
      {failed ? <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white"><TriangleAlert className="size-8 text-amber-300" /><h3 className="font-semibold">La visioconférence n’a pas pu se charger</h3><p className="text-sm text-white/70">Vérifiez votre connexion puis rechargez la page.</p><Button variant="outline" className="border-white/30 text-white hover:bg-white/10" onClick={() => location.reload()}>Recharger</Button></div> : null}
      {left ? <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-brand-950 p-6 text-center text-white"><h3 className="h3 text-white">Vous avez quitté la salle</h3><Button onClick={() => location.reload()}>Rejoindre à nouveau</Button></div> : null}
    </div>
  );
}
