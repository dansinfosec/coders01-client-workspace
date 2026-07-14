/**
 * Image + logo preparation for Roofing Center.
 *
 * - READS the client source assets (clients/roofing-center/assets/) — NEVER writes there.
 * - Copies the original logo untouched into public/.../original-logo/.
 * - Derives usable logo variants from the original by LUMINANCE KEYING (not AI):
 *   the white logo sits on a solid black background, so luminance = alpha gives a
 *   clean transparent white/navy logo with the exact original text/shapes preserved.
 * - Generates optimized WebP + JPEG copies of the SELECTED photos at web sizes.
 *
 * Run with: npm run prepare:images
 */
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { mkdir, copyFile } from "node:fs/promises";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "..", "roofing-center", "assets"); // client source (read-only)
const OUT = join(ROOT, "public", "images", "roofing-center");

const NAVY = "#0D222D";
const photo = (name) => join(SRC, "photos", `WhatsApp Image 2026-07-14 at 20.02.${name}.jpeg`);

// Selected photos → { src, dir, base, maxW }. Only the strongest images are used.
const PHOTOS = [
  // Heroes
  { src: "44", dir: "optimized", base: "hero-plat-dak-overzicht", maxW: 1920 },
  { src: "48", dir: "optimized", base: "hero-mobiel-dakrenovatie", maxW: 1200 },
  { src: "44", dir: "optimized", base: "og-image", maxW: 1200, crop: [1200, 630] },
  // Service images
  { src: "50 (4)", dir: "services", base: "bitumen-branden", maxW: 1400 },
  { src: "49 (5)", dir: "services", base: "nieuwe-dakbedekking", maxW: 1400 },
  { src: "51 (5)", dir: "services", base: "vakmanschap-afwerking", maxW: 1400 },
  { src: "50 (5)", dir: "services", base: "epdm-bevestiging", maxW: 1400 },
  { src: "49", dir: "services", base: "dakinspectie-bestaand", maxW: 1400 },
  { src: "52", dir: "services", base: "dakschade-inspectie", maxW: 1400 },
  { src: "51 (1)", dir: "services", base: "afgewerkt-bitumen-dak", maxW: 1400 },
  // Project gallery
  { src: "51 (3)", dir: "projects", base: "dakdoorvoer-detail", maxW: 1600 },
  { src: "51 (4)", dir: "projects", base: "platte-daken-detailwerk", maxW: 1600 },
  { src: "49 (1)", dir: "projects", base: "aanbouw-plat-dak", maxW: 1600 },
  { src: "50 (2)", dir: "projects", base: "uitbouw-dakbedekking", maxW: 1600 },
  { src: "51 (2)", dir: "projects", base: "afgewerkt-membraandak", maxW: 1600 },
  { src: "51 (7)", dir: "projects", base: "lichtkoepel-plat-dak", maxW: 1600 },
  { src: "51", dir: "projects", base: "lang-plat-dak-grind", maxW: 1600 },
  { src: "52 (3)", dir: "projects", base: "epdm-installatie", maxW: 1600 },
  { src: "51 (6)", dir: "projects", base: "dakopbouw-onderlaag", maxW: 1600 },
  { src: "52 (6)", dir: "projects", base: "verse-bitumen", maxW: 1600 },
  { src: "52 (1)", dir: "projects", base: "wateroverlast-inspectie", maxW: 1600 },
  { src: "48", dir: "projects", base: "residentieel-plat-dak", maxW: 1600 },
];

async function ensureDirs() {
  for (const d of ["original-logo", "generated-logo", "projects", "services", "optimized"]) {
    await mkdir(join(OUT, d), { recursive: true });
  }
}

async function processPhotos() {
  const manifest = [];
  for (const p of PHOTOS) {
    const input = photo(p.src);
    let img = sharp(input).rotate(); // respect EXIF orientation
    if (p.crop) {
      img = img.resize(p.crop[0], p.crop[1], { fit: "cover", position: "centre" });
    } else {
      img = img.resize({ width: p.maxW, withoutEnlargement: true });
    }
    const buf = await img.toBuffer();
    const meta = await sharp(buf).metadata();
    const outBase = join(OUT, p.dir, p.base);
    await sharp(buf).webp({ quality: 74 }).toFile(`${outBase}.webp`);
    await sharp(buf).jpeg({ quality: 80, mozjpeg: true }).toFile(`${outBase}.jpg`);
    manifest.push({ base: `${p.dir}/${p.base}`, w: meta.width, h: meta.height });
    console.log(`  photo  ${p.dir}/${p.base}  ${meta.width}x${meta.height}`);
  }
  return manifest;
}

async function processLogo() {
  const logoSrc = join(SRC, "logo", "logo-roofing-center.jpg");
  // 1) Keep the original untouched.
  await copyFile(logoSrc, join(OUT, "original-logo", "logo-roofing-center.jpg"));

  const meta = await sharp(logoSrc).metadata();
  const w = meta.width, h = meta.height;
  // Luminance mask (single channel): white parts -> opaque, black bg -> transparent.
  const lumaMask = await sharp(logoSrc).toColourspace("b-w").raw().toBuffer();
  const rawMask = { raw: { width: w, height: h, channels: 1 } };

  // White logo on transparent (for dark/navy backgrounds).
  await sharp({ create: { width: w, height: h, channels: 3, background: "#ffffff" } })
    .joinChannel(lumaMask, rawMask)
    .png()
    .toFile(join(OUT, "generated-logo", "logo-white-transparent.png"));

  // Navy logo on transparent (for light backgrounds).
  await sharp({ create: { width: w, height: h, channels: 3, background: NAVY } })
    .joinChannel(lumaMask, rawMask)
    .png()
    .toFile(join(OUT, "generated-logo", "logo-navy-transparent.png"));

  // Favicon: crop the left icon region (roofer torching bitumen), trim, place on a navy square.
  const iconCrop = await sharp(logoSrc)
    .extract({ left: 0, top: 0, width: Math.round(w * 0.28), height: h })
    .toColourspace("b-w")
    .toBuffer();
  const iconW = Math.round(w * 0.28);
  const iconWhite = await sharp({ create: { width: iconW, height: h, channels: 3, background: "#ffffff" } })
    .joinChannel(await sharp(iconCrop).raw().toBuffer(), { raw: { width: iconW, height: h, channels: 1 } })
    .png()
    .trim()
    .toBuffer();

  for (const size of [512, 192, 180, 32]) {
    const pad = Math.round(size * 0.16);
    const inner = await sharp(iconWhite)
      .resize(size - pad * 2, size - pad * 2, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .toBuffer();
    await sharp({ create: { width: size, height: size, channels: 4, background: NAVY } })
      .composite([{ input: inner, gravity: "centre" }])
      .png()
      .toFile(join(OUT, "generated-logo", `favicon-${size}.png`));
  }
  // Root favicon + apple touch (copied into public/ root by app references).
  await copyFile(join(OUT, "generated-logo", "favicon-32.png"), join(ROOT, "public", "favicon.png"));
  await copyFile(join(OUT, "generated-logo", "favicon-180.png"), join(ROOT, "public", "apple-touch-icon.png"));
  console.log("  logo   original preserved + white/navy transparent + favicons generated");
}

async function main() {
  await ensureDirs();
  console.log("Optimizing Roofing Center assets…");
  await processLogo();
  const manifest = await processPhotos();
  console.log(`Done. ${manifest.length} photos optimized (WebP + JPEG).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
