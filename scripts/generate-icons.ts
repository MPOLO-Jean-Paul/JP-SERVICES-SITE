import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/** Génère les icônes PWA / Apple à partir du monogramme vectoriel. */
const mark = (size: number, padding: number, rounded: boolean) => {
  const inner = size - padding * 2;
  const s = inner / 32;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rounded ? size * 0.22 : 0}" fill="#09090b"/>
  <g transform="translate(${padding} ${padding}) scale(${s})">
    <path d="M12.5 8.5v10.25a4.25 4.25 0 0 1-4.25 4.25H7.5" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M17 23.5v-15h4.25a4.25 4.25 0 0 1 0 8.5H17" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="25" cy="23" r="1.9" fill="#3d63ff"/>
  </g></svg>`;
};

async function main() {
  const out = path.join(process.cwd(), "public", "icons");
  await mkdir(out, { recursive: true });
  const jobs: Array<[string, number, number, boolean]> = [
    ["icon-192.png", 192, 0, true],
    ["icon-512.png", 512, 0, true],
    ["icon-maskable-512.png", 512, 96, false],
    ["apple-touch-icon.png", 180, 0, false],
  ];
  for (const [name, size, pad, rounded] of jobs) {
    await writeFile(path.join(out, name), await sharp(Buffer.from(mark(size, pad, rounded))).png().toBuffer());
    console.log("✔", name);
  }
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
