import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}

/** Inner-page hero on a navy band. Renders the page's single <h1>. */
export function PageHero({ eyebrow, title, subtitle, actions }: PageHeroProps) {
  return (
    <div className="bg-navy text-text-invert">
      <Container className="py-12 sm:py-16">
        {eyebrow && (
          <p className="eyebrow text-green">
            <span aria-hidden="true" className="inline-block h-1.5 w-1.5 rounded-full bg-green" />
            {eyebrow}
          </p>
        )}
        <h1 className="mt-3 max-w-3xl text-3xl font-bold text-text-invert sm:text-4xl lg:text-5xl">{title}</h1>
        {subtitle && <div className="mt-4 max-w-2xl text-lg leading-relaxed text-text-invert/80">{subtitle}</div>}
        {actions && <div className="mt-7 flex flex-wrap gap-3">{actions}</div>}
      </Container>
    </div>
  );
}
