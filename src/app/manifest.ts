import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JP-Services — Formations et services digitaux",
    short_name: "JP-Services",
    description: "Formations, logiciels, projets et communauté JP-Services.",
    lang: "fr",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#ffffff",
    theme_color: "#09090b",
    categories: ["education", "productivity"],
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Formations", url: "/formations", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Logiciels", url: "/logiciels", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
      { name: "Formations en ligne", url: "/formations-en-ligne", icons: [{ src: "/icons/icon-192.png", sizes: "192x192" }] },
    ],
  };
}
