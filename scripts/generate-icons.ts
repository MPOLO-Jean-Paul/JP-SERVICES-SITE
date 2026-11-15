import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

/** Génère les icônes PWA / Apple à partir du symbole vectoriel « Élan » (viewBox 64). */
const LOGO = `<rect x="8" y="34" width="9" height="16" rx="3" fill="#FF4D3D"/>
    <rect x="21" y="24" width="9" height="26" rx="3" fill="#7B4DFF"/>
    <path d="M38.5 10v29.5a10.5 10.5 0 0 1-10.5 10.5" fill="none" stroke="#2F5BFF" stroke-width="9" stroke-linecap="round"/>
    <circle cx="51" cy="14" r="5" fill="#2F5BFF"/>`;
const mark = (size: number, padding: number, rounded: boolean) => {
  const inner = size - padding * 2;
  const s = (inner * 0.8) / 64;
  const offset = padding + inner * 0.1;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${rounded ? size * 0.22 : 0}" fill="#0b0d1a"/>
  <g transform="translate(${offset} ${offset}) scale(${s})">
    ${LOGO}
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
