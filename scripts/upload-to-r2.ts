import "dotenv/config";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * Copie les fichiers du dossier local des téléversements (UPLOAD_DIR, par défaut ./uploads)
 * vers le bucket S3/R2, sous les mêmes clés (« uploads/… »). À utiliser une fois pour
 * transférer les médias historiques (actualités, logiciels) avant de passer en STORAGE_DRIVER=s3.
 */
const MIME: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", avif: "image/avif", mp4: "video/mp4", pdf: "application/pdf" };

async function* walk(dir: string): AsyncGenerator<string> {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (!entry.name.startsWith(".")) yield full;
  }
}

async function main() {
  const { S3_BUCKET, S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;
  if (!S3_BUCKET || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) throw new Error("S3_BUCKET, S3_ACCESS_KEY_ID et S3_SECRET_ACCESS_KEY sont requis.");
  const root = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
  const client = new S3Client({ region: process.env.S3_REGION || "auto", endpoint: S3_ENDPOINT, forcePathStyle: Boolean(S3_ENDPOINT), credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY } });
  let n = 0;
  for await (const file of walk(root)) {
    const key = "uploads/" + path.relative(root, file).split(path.sep).join("/");
    const ext = (file.split(".").pop() ?? "").toLowerCase();
    await client.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: key, Body: await readFile(file), ContentType: MIME[ext] ?? "application/octet-stream", CacheControl: "public, max-age=31536000, immutable" }));
    n++;
    console.log(`✔ ${key} (${Math.round((await stat(file)).size / 1024)} Ko)`);
  }
  console.log(`\n${n} fichier(s) envoyé(s) vers ${S3_BUCKET}.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
