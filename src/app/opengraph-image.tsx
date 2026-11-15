import { ImageResponse } from "next/og";

export const alt = "JP-Services — Formations, logiciels et services digitaux";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Image de partage générée (aucune photo) : grille, monogramme et titre. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#070a18", color: "#fff", backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "56px 56px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill="#ffffff" />
            <path d="M12.5 8.5v10.25a4.25 4.25 0 0 1-4.25 4.25H7.5" fill="none" stroke="#070a18" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M17 23.5v-15h4.25a4.25 4.25 0 0 1 0 8.5H17" fill="none" stroke="#070a18" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="25" cy="23" r="1.9" fill="#3d63ff" />
          </svg>
          <span style={{ fontSize: 34, fontWeight: 600, letterSpacing: -1 }}>JP-Services</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: "#93b0ff" }}>Formations · Logiciels · Communauté</span>
          <span style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: -3, marginTop: 20, maxWidth: 980 }}>Apprenez les compétences qui font avancer vos projets.</span>
        </div>
        <span style={{ fontSize: 24, color: "rgba(255,255,255,0.6)" }}>Lubumbashi · République démocratique du Congo</span>
      </div>
    ),
    size,
  );
}
