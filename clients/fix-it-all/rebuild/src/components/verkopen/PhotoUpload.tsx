import { useCallback, useEffect, useRef, useState } from "react";
import { UploadCloud, X, Loader2, AlertCircle, RefreshCw, ImageOff, ShieldCheck } from "lucide-react";
import {
  processImage,
  ImageError,
  formatBytes,
  ACCEPT_ATTR,
  MAX_PHOTOS,
  MIN_PHOTOS_COMPLETE,
  type ProcessedImage,
} from "@/lib/image";
import { photoSlots } from "@/data/vehicleSale";
import { cn } from "@/utils/cn";

interface PhotoUploadProps {
  /** Callback met de succesvol verwerkte foto's (voor de payload). */
  onChange: (photos: ProcessedImage[]) => void;
}

type Item =
  | { id: string; status: "processing"; name: string }
  | { id: string; status: "error"; name: string; file: File; message: string }
  | { id: string; status: "done"; image: ProcessedImage };

let seq = 0;
const tmpId = () => `tmp-${seq++}`;

const itemName = (i: Item): string => (i.status === "done" ? i.image.name : i.name);

const errMessage = (e: unknown): string =>
  e instanceof ImageError
    ? e.code === "too_large"
      ? "Bestand te groot (max. 15 MB)."
      : e.code === "wrong_type"
        ? "Niet-ondersteund bestandstype."
        : "Kon de foto niet verwerken."
    : "Kon de foto niet verwerken.";

export function PhotoUpload({ onChange }: PhotoUploadProps) {
  const [items, setItems] = useState<Item[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doneCount = items.filter((i) => i.status === "done").length;

  // Spiegel de actuele lijst in een ref, zodat de unmount-cleanup geen state hoeft te lezen.
  const itemsRef = useRef<Item[]>([]);
  itemsRef.current = items;

  // Emit verwerkte foto's naar de ouder wanneer de lijst wijzigt.
  useEffect(() => {
    onChange(items.filter((i): i is Extract<Item, { status: "done" }> => i.status === "done").map((i) => i.image));
  }, [items, onChange]);

  // Ruim object-URL's op bij unmount.
  useEffect(() => {
    return () => {
      itemsRef.current.forEach(
        (i) => i.status === "done" && i.image.previewUrl && URL.revokeObjectURL(i.image.previewUrl),
      );
    };
  }, []);

  const processOne = useCallback(async (id: string, file: File) => {
    try {
      const image = await processImage(file);
      setItems((cur) => cur.map((i) => (i.id === id ? { id, status: "done", image } : i)));
    } catch (e) {
      setItems((cur) => cur.map((i) => (i.id === id ? { id, status: "error", name: file.name, file, message: errMessage(e) } : i)));
    }
  }, []);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      setItems((cur) => {
        const room = MAX_PHOTOS - cur.length;
        const accepted = list.slice(0, Math.max(0, room));
        const newItems: Item[] = accepted.map((file) => {
          const id = tmpId();
          void processOne(id, file);
          return { id, status: "processing", name: file.name };
        });
        return [...cur, ...newItems];
      });
    },
    [processOne],
  );

  const remove = (id: string) =>
    setItems((cur) => {
      const target = cur.find((i) => i.id === id);
      if (target?.status === "done" && target.image.previewUrl) URL.revokeObjectURL(target.image.previewUrl);
      return cur.filter((i) => i.id !== id);
    });

  const retry = (id: string) =>
    setItems((cur) => {
      const target = cur.find((i) => i.id === id);
      if (target?.status === "error") {
        void processOne(id, target.file);
        return cur.map((i) => (i.id === id ? { id, status: "processing", name: target.name } : i));
      }
      return cur;
    });

  const onInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = ""; // opnieuw dezelfde file kunnen kiezen
  };

  const atMax = items.length >= MAX_PHOTOS;

  return (
    <div>
      {/* Gewenste hoeken */}
      <p className="text-sm text-text-muted">
        Maak duidelijke foto's — bij voorkeur bij daglicht. Handig zijn deze hoeken:
      </p>
      <ul className="mt-3 flex flex-wrap gap-1.5">
        {photoSlots.map((s) => (
          <li key={s.id} className="rounded-md border border-line bg-surface px-2.5 py-1 font-mono text-2xs uppercase tracking-label text-text-muted">
            {s.label}
          </li>
        ))}
      </ul>

      {/* Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "mt-5 rounded-2xl border-2 border-dashed p-6 text-center transition-colors",
          dragOver ? "border-petrol bg-petrol-soft" : "border-line-strong bg-surface",
          atMax && "opacity-60",
        )}
      >
        <UploadCloud className="mx-auto h-8 w-8 text-petrol" aria-hidden />
        <p className="mt-3 text-sm text-text-body">
          Sleep foto's hierheen of{" "}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={atMax}
            className="font-semibold text-petrol hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-petrol disabled:cursor-not-allowed disabled:text-text-muted"
          >
            kies van uw apparaat
          </button>
        </p>
        <p className="mt-1 font-mono text-2xs uppercase tracking-label text-text-muted">
          JPG · PNG · WebP · HEIC — max. {MAX_PHOTOS} foto's, 15 MB per stuk
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT_ATTR}
          multiple
          capture="environment"
          onChange={onInput}
          className="sr-only"
          aria-label="Foto's kiezen"
        />
      </div>

      {/* Privacy-melding */}
      <p className="mt-3 flex items-start gap-2 text-xs text-text-muted">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-petrol" aria-hidden />
        Foto's worden in uw browser verkleind en van locatiegegevens (EXIF-GPS) ontdaan voordat ze worden verzonden.
      </p>

      {/* Voortgangsindicatie foto's */}
      <p className="mt-4 text-sm font-semibold text-text-strong" aria-live="polite">
        {doneCount} van minimaal {MIN_PHOTOS_COMPLETE} foto's
        {doneCount >= MIN_PHOTOS_COMPLETE && <span className="ml-1 text-success">— compleet</span>}
      </p>
      {doneCount < MIN_PHOTOS_COMPLETE && (
        <p className="mt-1 text-xs text-text-muted">
          U kunt met minder foto's verzenden, maar met minimaal {MIN_PHOTOS_COMPLETE} foto's kunnen wij uw auto beter beoordelen.
        </p>
      )}

      {/* Previews */}
      {items.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="relative overflow-hidden rounded-xl border border-line bg-surface">
              <div className="flex aspect-[4/3] items-center justify-center bg-surface-muted">
                {item.status === "done" && item.image.previewUrl ? (
                  <img src={item.image.previewUrl} alt={item.image.name} className="h-full w-full object-cover" />
                ) : item.status === "processing" ? (
                  <Loader2 className="h-6 w-6 animate-spin text-text-muted" aria-hidden />
                ) : item.status === "error" ? (
                  <AlertCircle className="h-6 w-6 text-error" aria-hidden />
                ) : (
                  <ImageOff className="h-6 w-6 text-text-muted" aria-hidden />
                )}
              </div>

              <div className="flex items-center justify-between gap-2 px-2.5 py-1.5">
                <span className="min-w-0 flex-1 truncate font-mono text-2xs text-text-muted" title={itemName(item)}>
                  {item.status === "done"
                    ? formatBytes(item.image.size)
                    : item.status === "processing"
                      ? "Verwerken…"
                      : item.message}
                </span>
                <div className="flex shrink-0 items-center gap-1">
                  {item.status === "error" && (
                    <button type="button" onClick={() => retry(item.id)} aria-label="Opnieuw proberen" className="rounded p-1 text-petrol hover:bg-petrol-soft">
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                    </button>
                  )}
                  <button type="button" onClick={() => remove(item.id)} aria-label={`Verwijder ${itemName(item)}`} className="rounded p-1 text-text-muted hover:bg-surface-muted hover:text-error">
                    <X className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </div>
              </div>

              {item.status === "done" && item.image.note && (
                <p className="border-t border-line bg-status-reserved/10 px-2.5 py-1 text-2xs text-text-body">{item.image.note}</p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
