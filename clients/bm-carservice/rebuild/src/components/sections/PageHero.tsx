import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/utils/cn";

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeroProps {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  crumbs?: Crumb[];
  tone?: "ink" | "concrete";
  children?: ReactNode;
}

/** Inner-page header with breadcrumbs + one h1. */
export function PageHero({ eyebrow, title, intro, crumbs, tone = "ink", children }: PageHeroProps) {
  const onInk = tone === "ink";
  return (
    <section className={cn(onInk ? "bg-ink text-text-invert" : "bg-surface-muted text-text-body")}>
      <Container className="py-12 sm:py-16">
        {crumbs && crumbs.length > 0 && (
          <nav aria-label="Kruimelpad" className="mb-5">
            <ol className="flex flex-wrap items-center gap-1 font-mono text-xs">
              {crumbs.map((c, i) => (
                <li key={i} className="flex items-center gap-1">
                  {c.to ? (
                    <Link
                      to={c.to}
                      className={cn("hover:underline", onInk ? "text-text-invert/60" : "text-text-muted")}
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span className={onInk ? "text-signal" : "text-text-strong"}>{c.label}</span>
                  )}
                  {i < crumbs.length - 1 && (
                    <ChevronRight className={cn("h-3.5 w-3.5", onInk ? "text-text-invert/40" : "text-text-muted")} />
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
        {eyebrow && (
          <p className={cn("eyebrow", onInk && "text-signal")}>{eyebrow}</p>
        )}
        <h1
          className={cn(
            "mt-3 max-w-3xl text-4xl leading-[1.08] sm:text-5xl",
            onInk ? "text-text-invert" : "text-text-strong",
          )}
        >
          {title}
        </h1>
        {intro && (
          <p className={cn("mt-4 max-w-2xl text-lg", onInk ? "text-text-invert/80" : "text-text-body")}>
            {intro}
          </p>
        )}
        {children && <div className="mt-7">{children}</div>}
      </Container>
      {onInk && <div aria-hidden="true" className="h-3 w-full bg-hazard" />}
    </section>
  );
}
