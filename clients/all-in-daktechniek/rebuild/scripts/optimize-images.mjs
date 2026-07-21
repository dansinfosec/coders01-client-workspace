// Dev-only image pipeline for All-in Daktechniek.
// Reads originals from ../assets/original, writes optimized WebP to
// ../assets/optimized AND to public/images/all-in-daktechniek (shipped).
// Also writes a favicon derived from the logo. Not part of the app bundle.
//
// Run: npm run prepare:images   (requires the downloaded originals)

import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join, basename, extname } from "node:path";
import { mkdirSync, existsSync, readdirSync, copyFileSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));
const originalDir = join(here, "..", "..", "assets", "original");
const optimizedDir = join(here, "..", "..", "assets", "optimized");
const publicDir = join(here, "..", "public", "images", "all-in-daktechniek");

for (const d of [optimizedDir, publicDir]) mkdirSync(d, { recursive: true });

// Map original filenames → shipped webp basenames (max width for each use).
const targets = {
  "slider-platte-daken.jpg": { out: "slider-platte-daken", w: 1600 },
  "slider-pannendaken.jpg": { out: "slider-pannendaken", w: 1600 },
  "slider-lood-zinkwerk.jpg": { out: "slider-lood-zinkwerk", w: 1600 },
  "slider-schoorstenen.jpg": { out: "slider-schoorstenen", w: 1600 },
  "slider-dakisolatie.jpg": { out: "slider-dakisolatie", w: 1600 },
  "pannendaken-2.jpg": { out: "pannendaken-2", w: 1200 },
  "pannendaken-3.jpeg": { out: "pannendaken-3", w: 1200 },
  "pannendaken-4.jpg": { out: "pannendaken-4", w: 1200 },
  "dakisolatie-1.jpg": { out: "dakisolatie-1", w: 1200 },
  "dakisolatie-2.jpg": { out: "dakisolatie-2", w: 1200 },
  "project-plat-dak-171237.jpg": { out: "project-plat-dak-171237", w: 1200 },
  "project-171357.jpg": { out: "project-171357", w: 1200 },
};

async function run() {
  if (!existsSync(originalDir)) {
    console.error("No originals found at", originalDir);
    process.exit(1);
  }
  const files = readdirSync(originalDir);
  let n = 0;
  for (const [src, { out, w }] of Object.entries(targets)) {
    if (!files.includes(src)) {
      console.warn("skip (missing):", src);
      continue;
    }
    const input = join(originalDir, src);
    const pipeline = sharp(input).rotate().resize({ width: w, withoutEnlargement: true });
    // optimized master (kept in assets/optimized) + shipped copy in public/
    for (const dir of [optimizedDir, publicDir]) {
      await pipeline
        .clone()
        .webp({ quality: 78 })
        .toFile(join(dir, `${out}.webp`));
    }
    n++;
    console.log("webp:", `${out}.webp`, `(${w}px)`);
  }

  // Favicon from the logo (padded onto a transparent square).
  const logo = join(originalDir, "logo.png");
  if (existsSync(logo)) {
    await sharp(logo)
      .resize({ width: 180, height: 180, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(join(here, "..", "public", "apple-touch-icon.png"));
    await sharp(logo)
      .resize({ width: 64, height: 64, fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(join(here, "..", "public", "favicon.png"));
    console.log("favicon + apple-touch-icon written");
  }

  console.log(`\nDone. ${n} images optimized.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
