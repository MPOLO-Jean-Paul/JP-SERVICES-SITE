import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/activation", "/inscription", "/connexion", "/mot-de-passe-oublie", "/mot-de-passe/", "/profil", "/abonnements", "/notifications", "/mes-projets", "/recherche"] }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
