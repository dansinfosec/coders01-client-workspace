import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  image?: string;
}

/** Compact ink hero for interior pages (one <h1> per page). */
export function PageHero({ eyebrow, title, intro, image }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-ink text-text-invert">
      {image && (
        <div className="absolute inset-0">
          <img
            src={image}
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover opacity-25"
            width={1600}
            height={1067}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/90 to-ink/70" />
        </div>
      )}
      <Container className="relative py-14 sm:py-20">
        <div className="max-w-2xl">
          {eyebrow && <p className="eyebrow text-green">{eyebrow}</p>}
          <h1 className="mt-2 text-3xl font-extrabold text-text-invert sm:text-4xl">{title}</h1>
          {intro && <p className="mt-4 text-lg text-text-invert/80">{intro}</p>}
        </div>
      </Container>
    </section>
  );
}
