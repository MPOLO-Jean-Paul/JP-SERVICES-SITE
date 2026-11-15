import "server-only";
import { randomBytes } from "node:crypto";
import { mkdir, unlink, writeFile, stat } from "node:fs/promises";
import path from "node:path";
import { env } from "@/env";

export type UploadKind = "image" | "software" | "logo";

const IMAGE_TYPES: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };
const SOFTWARE_EXT = new Set(["zip", "apk", "exe", "msi", "dmg", "pkg", "deb", "rar", "7z", "pdf"]);

export const UPLOAD_LIMITS = { image: 5 * 1024 * 1024, logo: 2 * 1024 * 1024, software: 50 * 1024 * 1024 } as const;

function sniffImageType(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") return "image/webp";
  if (buf.subarray(0, 6).toString("ascii") === "GIF87a" || buf.subarray(0, 6).toString("ascii") === "GIF89a") return "image/gif";
  if (buf.subarray(4, 12).toString("ascii").includes("ftypavif")) return "image/avif";
  return null;
}

export class UploadError extends Error {}

/**
 * Valide un fichier téléversé (type réel, taille, extension) et le stocke via le pilote configuré.
 * Retourne le chemin relatif persisté en base (ex. « uploads/formations/abcd.webp »).
 */
export async function storeUpload(file: File, kind: UploadKind, folder: string): Promise<string> {
  const limit = UPLOAD_LIMITS[kind];
  if (file.size <= 0) throw new UploadError("Fichier vide.");
  if (file.size > limit) throw new UploadError(`Le fichier dépasse la taille autorisée (${Math.round(limit / 1024 / 1024)} Mo).`);
  const buffer = Buffer.from(await file.arrayBuffer());
  let ext: string;
  let contentType: string;
  if (kind === "image" || kind === "logo") {
    const type = sniffImageType(buffer);
    if (!type || !IMAGE_TYPES[type]) throw new UploadError("Format d'image non reconnu (JPEG, PNG, WebP, GIF, AVIF).");
    ext = IMAGE_TYPES[type]!;
    contentType = type;
  } else {
    ext = (file.name.split(".").pop() ?? "").toLowerCase();
    if (!SOFTWARE_EXT.has(ext)) throw new UploadError("Format de fichier non autorisé (zip, apk, exe, msi, dmg, pkg, deb, rar, 7z, pdf).");
    contentType = "application/octet-stream";
  }
  const safeFolder = folder.replace(/[^a-z0-9/_-]/gi, "").replace(/^\/+|\/+$/g, "");
  const name = `${randomBytes(12).toString("hex")}.${ext}`;
  const key = `uploads/${safeFolder}/${name}`;
  if (env.STORAGE_DRIVER === "s3") {
    await s3Put(key, buffer, contentType);
  } else {
    const dest = path.join(process.cwd(), "public", key);
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, buffer, { mode: 0o644 });
  }
  return key;
}

export async function deleteUpload(key: string | null | undefined): Promise<void> {
  const normalized = (key ?? "").replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized.startsWith("uploads/") || normalized.includes("..")) return;
  try {
    if (env.STORAGE_DRIVER === "s3") await s3Delete(normalized);
    else await unlink(path.join(process.cwd(), "public", normalized));
  } catch {
    /* fichier déjà absent */
  }
}

/** URL publique d'un chemin stocké. */
export function publicUrl(key: string): string {
  if (/^https?:\/\//i.test(key)) return key;
  const normalized = key.replace(/^\/+/, "");
  if (env.STORAGE_DRIVER === "s3" && env.S3_PUBLIC_URL && normalized.startsWith("uploads/")) {
    return `${env.S3_PUBLIC_URL.replace(/\/$/, "")}/${normalized}`;
  }
  return "/" + normalized;
}

/** Flux de lecture pour les téléchargements contrôlés (logiciels). */
export async function readUploadStream(key: string): Promise<{ body: ReadableStream | Buffer; size: number } | null> {
  const normalized = key.replace(/\\/g, "/").replace(/^\/+/, "");
  if (!normalized.startsWith("uploads/logiciels/") || normalized.includes("..")) return null;
  if (env.STORAGE_DRIVER === "s3") return s3Get(normalized);
  const full = path.join(process.cwd(), "public", normalized);
  try {
    const info = await stat(full);
    const { createReadStream } = await import("node:fs");
    const { Readable } = await import("node:stream");
    return { body: Readable.toWeb(createReadStream(full)) as ReadableStream, size: info.size };
  } catch {
    return null;
  }
}

/* ───────── S3 / Cloudflare R2 ───────── */
async function s3Client() {
  const { S3Client } = await import("@aws-sdk/client-s3");
  if (!env.S3_BUCKET || !env.S3_ACCESS_KEY_ID || !env.S3_SECRET_ACCESS_KEY) throw new UploadError("Stockage S3 incomplet : vérifiez S3_BUCKET et les clés d'accès.");
  return new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: Boolean(env.S3_ENDPOINT),
    credentials: { accessKeyId: env.S3_ACCESS_KEY_ID, secretAccessKey: env.S3_SECRET_ACCESS_KEY },
  });
}
async function s3Put(key: string, body: Buffer, contentType: string) {
  const { PutObjectCommand } = await import("@aws-sdk/client-s3");
  await (await s3Client()).send(new PutObjectCommand({ Bucket: env.S3_BUCKET, Key: key, Body: body, ContentType: contentType, CacheControl: "public, max-age=31536000, immutable" }));
}
async function s3Delete(key: string) {
  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");
  await (await s3Client()).send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
}
async function s3Get(key: string) {
  const { GetObjectCommand } = await import("@aws-sdk/client-s3");
  const res = await (await s3Client()).send(new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: key }));
  if (!res.Body) return null;
  return { body: res.Body.transformToWebStream() as ReadableStream, size: Number(res.ContentLength ?? 0) };
}
