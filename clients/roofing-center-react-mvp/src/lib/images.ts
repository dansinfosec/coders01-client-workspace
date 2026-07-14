const ROOT = "/images/roofing-center";

/** Build WebP + JPEG URLs for an optimized image base path (no extension). */
export function imageSources(base: string): { webp: string; jpg: string } {
  return { webp: `${ROOT}/${base}.webp`, jpg: `${ROOT}/${base}.jpg` };
}

export const logoAssets = {
  white: `${ROOT}/generated-logo/logo-white-transparent.png`,
  navy: `${ROOT}/generated-logo/logo-navy-transparent.png`,
  originalJpg: `${ROOT}/original-logo/logo-roofing-center.jpg`,
  // intrinsic logo ratio (1290 x 390)
  width: 1290,
  height: 390,
};
