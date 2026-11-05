/**
 * Recompress every image in public/ over 150KB, in place.
 *
 *   node scripts/compress-images.mjs           compress and print a table
 *   node scripts/compress-images.mjs --dry     print what it would do
 *
 * Same file name and format, so no path in the code or in Supabase changes.
 * Same pixel size, unless an image is wider than 1600px — then 1600px wide.
 * A file is only rewritten when the new one is actually smaller.
 *
 * WebP and JPEG at quality 75. PNG becomes a dithered 256-colour palette.
 * Run it once per new image: every run re-encodes anything still over 150KB,
 * and lossy-on-lossy only loses detail for a few percent.
 *
 * The storefront captures in public/shots are full-page screenshots up to
 * 16,383px tall (WebP's limit), so they stay well over 150KB at any quality
 * that keeps them sharp. They are lazy-loaded and never the LCP element.
 * `npm run shots` rewrites them at its own quality; run this again after it.
 */
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = 'public';
const LIMIT = 150 * 1024;
const MAX_WIDTH = 1600;
const dry = process.argv.includes('--dry');

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (/\.(png|jpe?g|webp)$/i.test(entry.name)) yield p;
  }
}

function encode(img, ext) {
  switch (ext) {
    case '.webp': return img.webp({ quality: 75, effort: 6, smartSubsample: true });
    // A full 256-colour palette with dithering (`effort` turns the palette on).
    // ~110KB for the share cards, with smooth glows; quality 90 got ~40KB but
    // put visible rings in the gradients, and truly lossless is ~160KB.
    case '.png': return img.png({ compressionLevel: 9, effort: 10, adaptiveFiltering: true });
    default: return img.jpeg({ quality: 75, mozjpeg: true });
  }
}

const kb = (n) => `${Math.round(n / 1024)} KB`;
const rows = [];

for await (const file of walk(ROOT)) {
  const before = (await stat(file)).size;
  if (before <= LIMIT) continue;

  const input = await readFile(file);
  const meta = await sharp(input).metadata();
  let img = sharp(input);
  if (meta.width > MAX_WIDTH) img = img.resize({ width: MAX_WIDTH });

  const out = await encode(img, path.extname(file).toLowerCase()).toBuffer();
  const kept = out.length >= before;
  if (!dry && !kept) await writeFile(file, out);

  rows.push({
    file: path.relative(ROOT, file).replace(/\\/g, '/'),
    before,
    after: kept ? before : out.length,
    note: kept ? 'kept (no smaller)' : meta.width > MAX_WIDTH ? `resized to ${MAX_WIDTH}w` : '',
  });
}

rows.sort((a, b) => b.before - a.before);
console.log('| file | size before | size after | saved |');
console.log('|---|---:|---:|---:|');
for (const r of rows) {
  const saved = Math.round((1 - r.after / r.before) * 100);
  console.log(`| ${r.file} | ${kb(r.before)} | ${kb(r.after)} | ${saved}%${r.note ? ` (${r.note})` : ''} |`);
}
if (dry) console.log('\n(dry run: nothing written)');
