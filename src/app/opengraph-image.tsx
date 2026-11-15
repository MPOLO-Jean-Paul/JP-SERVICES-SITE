import { ImageResponse } from "next/og";

export const alt = "JP-Services — Formations, logiciels et services digitaux";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Image de partage générée (aucune photo) : grille, symbole et titre. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "#070a18", color: "#fff", backgroundImage: "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)", backgroundSize: "56px 56px" }}>
        <svg width="96" height="96" viewBox="0 0 64 64">
          <rect x="9" y="36" width="8" height="16" rx="4" fill="#FF4D3D" />
          <path d="M21 46.71V24a4 4 0 0 1 8 0v20h-2a8 8 0 0 0-6 2.71z" fill="#7B4DFF" />
          <path d="M37 12v30a10 10 0 0 1-10 10" fill="none" stroke="#2F5BFF" strokeWidth="8" strokeLinecap="round" />
          <circle cx="50" cy="12" r="5" fill="#2F5BFF" />
        </svg>
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
