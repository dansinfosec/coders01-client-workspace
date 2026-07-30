import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/utils/cn";

export interface Crumb {
  label: string;
  to?: string;
}

interface PageHeroProps {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  crumbs?: Crumb[];
  children?: ReactNode;
  className?: string;
}

/** Standaard paginakop (donker asphalt-paneel) met breadcrumb. Herbruikbaar over subpagina's. */
export function PageHero({ eyebrow, title, intro, crumbs, children, className }: PageHeroProps) {
  return (
    <section className={cn("relative overflow-hidden bg-asphalt text-paper", className)}>
      <div className="blueprint pointer-events-none absolute inset-0 opacity-30" aria-hidden />
      <div
        className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-petrol/25 blur-3xl"
        aria-hidden
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-asphalt-900/70 to-transparent" aria-hidden />
      <Container className="relative py-14 sm:py-20">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Kruimelpad" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1 font-mono text-2xs uppercase tracking-label text-paper/55">
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-1">
                  {c.to ? (
                    <Link to={c.to} className="hover:text-white">
                      {c.label}
                    </Link>
                  ) : (
                    <span className="text-paper/80" aria-current="page">
                      {c.label}
                    </span>
                  )}
                  {i < crumbs.length - 1 && <ChevronRight className="h-3 w-3" aria-hidden />}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && <p className="eyebrow mb-3 text-torque">{eyebrow}</p>}
        <h1 className="max-w-3xl text-balance font-display text-4xl font-bold leading-[1.05] tracking-tightish text-paper sm:text-5xl">
          {title}
        </h1>
        {intro && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-paper/75">{intro}</p>}
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </section>
  );
}
