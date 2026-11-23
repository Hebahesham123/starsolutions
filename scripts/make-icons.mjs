/**
 * Favicons and app icons from public/logo.png (the StarSolution "S" mark).
 *
 *   node scripts/make-icons.mjs
 *
 * Writes to public/: favicon.ico (16, 32, 48 — PNG-in-ICO), icon-48.png,
 * icon-192.png, icon-512.png, apple-touch-icon.png (180, opaque white).
 * The small sizes use the mark trimmed of its margin, so it stays legible
 * at 16px; the larger ones keep a little breathing room.
 */
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const pub = (f) => fileURLToPath(new URL(`../public/${f}`, import.meta.url));
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

// The mark without its white margin, as a square.
const trimmed = await sharp(pub('logo.png')).trim({ background: '#ffffff', threshold: 10 }).toBuffer({ resolveWithObject: true });
const side = Math.max(trimmed.info.width, trimmed.info.height);
const square = await sharp(trimmed.data)
  .resize(side, side, { fit: 'contain', background: WHITE })
  .png().toBuffer();

/** The mark at `size`, with `pad` (fraction of the size) of white around it. */
const icon = (size, pad) => {
  const inner = Math.round(size * (1 - 2 * pad));
  const edge = Math.floor((size - inner) / 2);
  return sharp(square)
    .resize(inner, inner, { fit: 'contain', background: WHITE })
    .extend({ top: edge, left: edge, bottom: size - inner - edge, right: size - inner - edge, background: WHITE })
    .flatten({ background: WHITE })
    .png({ compressionLevel: 9 })
    .toBuffer();
};

const small = { 16: await icon(16, 0.02), 32: await icon(32, 0.04), 48: await icon(48, 0.06) };

// ICO with PNG payloads (supported by every current browser and by Google).
const sizes = [16, 32, 48];
const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
const dir = Buffer.alloc(16 * sizes.length);
let offset = 6 + dir.length;
sizes.forEach((s, i) => {
  const png = small[s];
  dir.writeUInt8(s, i * 16); dir.writeUInt8(s, i * 16 + 1);
  dir.writeUInt8(0, i * 16 + 2); dir.writeUInt8(0, i * 16 + 3);
  dir.writeUInt16LE(1, i * 16 + 4); dir.writeUInt16LE(32, i * 16 + 6);
  dir.writeUInt32LE(png.length, i * 16 + 8); dir.writeUInt32LE(offset, i * 16 + 12);
  offset += png.length;
});
writeFileSync(pub('favicon.ico'), Buffer.concat([header, dir, ...sizes.map((s) => small[s])]));
writeFileSync(pub('icon-48.png'), small[48]);
writeFileSync(pub('icon-192.png'), await icon(192, 0.1));
writeFileSync(pub('icon-512.png'), await icon(512, 0.1));
writeFileSync(pub('apple-touch-icon.png'), await icon(180, 0.12));
console.log('icons written');
