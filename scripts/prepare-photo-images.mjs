import sharp from 'sharp';
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const [mappingPath, srcDir, outDir] = process.argv.slice(2);
const mapping = JSON.parse(readFileSync(mappingPath, 'utf8'));
const rows = mapping['src/photo'];
let totalIn = 0;
let totalOut = 0;
let count = 0;
for (const [slug, images] of rows) {
  const dir = join(outDir, slug);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  let i = 0;
  for (const name of images) {
    i += 1;
    const src = join(srcDir, name);
    const dest = join(dir, String(i).padStart(2, '0') + '.webp');
    const img = sharp(src).resize({ width: 1600, withoutEnlargement: true });
    await img.webp({ quality: 80 }).toFile(dest);
    totalIn += statSync(src).size;
    totalOut += statSync(dest).size;
    count += 1;
  }
}
console.log('images=' + count + ' in=' + Math.round(totalIn / 1024) + 'KB out=' + Math.round(totalOut / 1024) + 'KB');