import { neon } from "@neondatabase/serverless";

export function getDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url || !/^postgres(?:ql)?:\/\//.test(url)) return null;
  // HTTP SQL : compatible avec Node.js (Render) et Cloudflare Workers.
  return neon(url);
}
