import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  {
    key: "Permissions-Policy",
    value: 'camera=(self "https://meet.jit.si"), microphone=(self "https://meet.jit.si"), geolocation=(), payment=()',
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  agentRules: false,
  poweredByHeader: false,
  output: process.env.NEXT_OUTPUT === "standalone" ? "standalone" : undefined,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.r2.dev" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
      {
        source: "/sw.js",
        headers: [{ key: "Cache-Control", value: "no-cache, no-store, must-revalidate, max-age=0" }],
      },
    ];
  },
  async redirects() {
    // Anciennes URL PHP → nouvelles routes (redirections permanentes pour le SEO).
    const legacy: Record<string, string> = {
      "/index.php": "/",
      "/formations.php": "/formations",
      "/formation_detail.php": "/formations",
      "/actualites.php": "/actualites",
      "/article.php": "/actualites",
      "/projets.php": "/projets",
      "/forum.php": "/forum",
      "/apropos.php": "/a-propos",
      "/contact.php": "/contact",
      "/aide.php": "/aide",
      "/connexion.php": "/connexion",
      "/inscription.php": "/inscription",
      "/logiciels.php": "/logiciels",
      "/partenariat.php": "/partenariat",
      "/formations-en-ligne.php": "/formations-en-ligne",
      "/conditions.php": "/conditions",
      "/confidentialite.php": "/confidentialite",
      "/cookies.php": "/cookies",
      "/profil.php": "/profil",
      "/mes_abonnements.php": "/abonnements",
      "/mes_notifications.php": "/notifications",
      "/produits.php": "/produits",
      "/solution_digitale.php": "/solution-digitale",
      "/ad/solution-digitale-tout-en-un.html": "/solution-digitale",
      "/ad/solution-digitale": "/solution-digitale",
    };
    return Object.entries(legacy).map(([source, destination]) => ({ source, destination, permanent: true }));
  },
};

export default withNextIntl(nextConfig);
