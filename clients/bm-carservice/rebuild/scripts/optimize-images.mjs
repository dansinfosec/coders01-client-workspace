/**
 * Optimise BM Carservice photos for the web.
 *
 * Reads curated originals from ../assets/original (or ../assets/optimized if you pre-curate)
 * and writes width-capped WebP files into public/images/bm-carservice/.
 * Run with: npm run prepare:images
 *
 * The rebuild is intentionally signage/typography-forward and works without photos, so this
 * is optional. When the team selects the best shots, drop them in assets/original (or pass a
 * curated map below) and run this script.
 */
import { readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.resolve(__dirname, "../../assets/original");
const OUT = path.resolve(__dirname, "../public/images/bm-carservice");
const MAX_WIDTH = 1600;
const QUALITY = 72;

async function run() {
  if (!existsSync(SRC)) {
    console.error(`Bronmap niet gevonden: ${SRC}`);
    process.exit(1);
  }
  await mkdir(OUT, { recursive: true });

  const files = (await readdir(SRC)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f));
  if (files.length === 0) {
    console.log("Geen afbeeldingen gevonden om te optimaliseren.");
    return;
  }

  let ok = 0;
  for (const file of files) {
    const base = file.replace(/\.[^.]+$/, "");
    const out = path.join(OUT, `${base}.webp`);
    try {
      const info = await sharp(path.join(SRC, file))
        .rotate()
        .resize({ width: MAX_WIDTH, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(out);
      console.log(`✓ ${file} → ${base}.webp (${info.width}×${info.height}, ${Math.round(info.size / 1024)} kB)`);
      ok++;
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`);
    }
  }
  console.log(`\nKlaar: ${ok}/${files.length} → ${OUT}`);
}

run();
