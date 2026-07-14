import { imageSources } from "@/lib/images";
import { cn } from "@/utils/cn";

interface ImgProps {
  /** Optimized image base path (no extension), e.g. "projects/aanbouw-plat-dak". */
  base: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  /** Priority (hero) images load eagerly; everything else lazy-loads. */
  priority?: boolean;
  sizes?: string;
}

/**
 * Responsive <picture> with WebP + JPEG fallback and explicit width/height to
 * prevent layout shift. Below-the-fold images lazy-load; the hero is prioritized.
 */
export function Img({ base, alt, width, height, className, priority = false, sizes }: ImgProps) {
  const { webp, jpg } = imageSources(base);
  return (
    <picture>
      <source type="image/webp" srcSet={webp} sizes={sizes} />
      <img
        src={jpg}
        alt={alt}
        width={width}
        height={height}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className={cn("object-cover", className)}
      />
    </picture>
  );
}
