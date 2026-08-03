/**
 * Image optimisation for the Allround Schadeherstel Utrecht preview.
 *
 * 1) Brand logo:   assets/original/logo.jpeg
 *      -> public/images/brand/logo.webp  (and logo.png fallback), width-capped.
 * 2) AI preview:   assets/original/higgsfield-preview-raw/*.{jpg,jpeg,png,webp}
 *      -> public/images/ai-preview/<name>.webp  (hero* capped at 1600px, rest 1200px).
 * 3) Google photos: assets/original/google-preview-raw/*  (none for this listing)
 *      -> public/images/google-preview/<name>.webp  (kept for future owner photos).
 *
 * Originals are NEVER overwritten. Run with: npm run prepare:images
 */
import { readdir, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ASSETS = path.resolve(ROOT, "../assets/original");

const IMG_RE = /\.(jpe?g|png|webp)$/i;
const HERO_WIDTH = 1600;
const STD_WIDTH = 1200;
const QUALITY = 78;

async function optimiseLogo() {
  const src = path.join(ASSETS, "logo.jpeg");
  if (!existsSync(src)) {
    console.log("• Logo niet gevonden, overgeslagen:", src);
    return;
  }
  const out = path.resolve(ROOT, "public/images/brand");
  await mkdir(out, { recursive: true });
  // The source is a 500×500 square with a large, uniform #242424 margin around a
  // horizontal lockup. Trim the uniform margin so the artwork fills the frame;
  // the residual dark background blends seamlessly on the anthracite header.
  const prep = () => sharp(src).trim({ threshold: 12 }).resize({ width: 720, withoutEnlargement: true });
  const webp = await prep().webp({ quality: 92 }).toFile(path.join(out, "logo.webp"));
  const png = await prep().png({ compressionLevel: 9 }).toFile(path.join(out, "logo.png"));
  console.log(`✓ logo.jpeg → brand/logo.webp (${webp.width}×${webp.height}, ${Math.round(webp.size / 1024)} kB)`);
  console.log(`✓ logo.jpeg → brand/logo.png  (${png.width}×${png.height}, ${Math.round(png.size / 1024)} kB)`);
}

async function optimiseFolder(srcDir, outDir, label) {
  if (!existsSync(srcDir)) return;
  await mkdir(outDir, { recursive: true });
  const files = (await readdir(srcDir)).filter((f) => IMG_RE.test(f));
  if (files.length === 0) {
    console.log(`• Geen bronbeelden in ${label} (${srcDir}).`);
    return;
  }
  for (const file of files) {
    const base = file.replace(/\.[^.]+$/, "");
    const width = /^hero/i.test(base) ? HERO_WIDTH : STD_WIDTH;
    try {
      const info = await sharp(path.join(srcDir, file))
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: QUALITY })
        .toFile(path.join(outDir, `${base}.webp`));
      console.log(`✓ ${label}/${file} → ${base}.webp (${info.width}×${info.height}, ${Math.round(info.size / 1024)} kB)`);
    } catch (err) {
      console.error(`✗ ${label}/${file}: ${err.message}`);
    }
  }
}

async function run() {
  await optimiseLogo();
  await optimiseFolder(
    path.join(ASSETS, "higgsfield-preview-raw"),
    path.resolve(ROOT, "public/images/ai-preview"),
    "ai-preview",
  );
  await optimiseFolder(
    path.join(ASSETS, "google-preview-raw"),
    path.resolve(ROOT, "public/images/google-preview"),
    "google-preview",
  );
  console.log("\nKlaar.");
}

run();
