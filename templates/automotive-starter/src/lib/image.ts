/**
 * Client-side beeldverwerking voor de auto-verkoopmodule.
 *
 * - Comprimeert mobiele foto's (schaalt naar max. lange zijde + her-encodeert als JPEG).
 * - **EXIF-locatie wordt gestript**: door de foto opnieuw via een <canvas> te encoderen gaan alle
 *   metadata (inclusief GPS) verloren. Privacy-by-design.
 * - HEIC/onbekende formaten die de browser niet kan decoderen worden ONgewijzigd doorgegeven met
 *   een notitie ("server-side converteren"); we forceren geen mislukte conversie in de client.
 *
 * NB: dit is een mock/frontend-verwerking. Er wordt niets naar een server geüpload — zie
 * services/vehicleSaleService.ts en docs/VEHICLE_SALE_BACKEND.md.
 */

export const IMAGE_MAX_DIMENSION = 1600;
export const IMAGE_QUALITY = 0.8;
export const MAX_FILE_BYTES = 15 * 1024 * 1024; // 15 MB per bestand (invoer)
export const MAX_PHOTOS = 12;
export const MIN_PHOTOS_COMPLETE = 5;

export const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
export const ACCEPT_ATTR = ".jpg,.jpeg,.png,.webp,.heic,.heif,image/*";

export interface ProcessedImage {
  id: string;
  /** Verwerkt bestand (gecomprimeerd waar mogelijk). */
  file: File;
  /** Object-URL voor preview ("" als niet weer te geven, bijv. HEIC). */
  previewUrl: string;
  name: string;
  /** Bytes na verwerking. */
  size: number;
  /** Bytes vóór verwerking. */
  originalSize: number;
  exifStripped: boolean;
  /** Optionele melding (bijv. HEIC). */
  note?: string;
}

function makeId(file: File): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === "function") return c.randomUUID();
  return `${file.name}-${file.size}-${performance.now()}`;
}

export function isAcceptedType(file: File): boolean {
  if (ACCEPTED_TYPES.includes(file.type)) return true;
  // Sommige browsers geven geen MIME voor HEIC — val terug op de extensie.
  return /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function loadImageEl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode_failed"));
    img.src = url;
  });
}

export class ImageError extends Error {
  code: "too_large" | "wrong_type" | "process_failed";
  constructor(code: "too_large" | "wrong_type" | "process_failed") {
    super(code);
    this.code = code;
    this.name = "ImageError";
  }
}

/**
 * Verwerk één bestand tot een ProcessedImage. Comprimeert en strip metadata waar mogelijk.
 * @throws ImageError("too_large" | "wrong_type" | "process_failed")
 */
export async function processImage(file: File): Promise<ProcessedImage> {
  if (!isAcceptedType(file)) throw new ImageError("wrong_type");
  if (file.size > MAX_FILE_BYTES) throw new ImageError("too_large");

  const id = makeId(file);
  const srcUrl = URL.createObjectURL(file);

  let img: HTMLImageElement;
  try {
    img = await loadImageEl(srcUrl);
  } catch {
    // Kon niet decoderen (waarschijnlijk HEIC/HEIF) → origineel behouden, server converteert later.
    return {
      id,
      file,
      previewUrl: "",
      name: file.name,
      size: file.size,
      originalSize: file.size,
      exifStripped: false,
      note: "Kan niet in de browser worden getoond — wij zetten dit formaat bij ontvangst om.",
    };
  } finally {
    // srcUrl niet meteen revoken: bij succes hergebruiken we niets ervan; canvas heeft de pixels.
  }

  const scale = Math.min(1, IMAGE_MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(1, Math.round(img.naturalWidth * scale));
  const h = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    URL.revokeObjectURL(srcUrl);
    throw new ImageError("process_failed");
  }
  ctx.drawImage(img, 0, 0, w, h);
  URL.revokeObjectURL(srcUrl);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", IMAGE_QUALITY),
  );
  if (!blob) throw new ImageError("process_failed");

  // Gebruik het origineel als compressie het niet kleiner maakt (bijv. al sterk gecomprimeerd).
  const useOriginal = blob.size >= file.size && /image\/jpe?g/i.test(file.type);
  const outName = file.name.replace(/\.(png|webp|heic|heif)$/i, ".jpg");
  const outFile = useOriginal
    ? file
    : new File([blob], outName, { type: "image/jpeg" });
  const previewUrl = URL.createObjectURL(outFile);

  return {
    id,
    file: outFile,
    previewUrl,
    name: outFile.name,
    size: outFile.size,
    originalSize: file.size,
    exifStripped: !useOriginal,
  };
}
