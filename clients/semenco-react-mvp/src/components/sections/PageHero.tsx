import type { ReactNode } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";

interface PageHeroProps {
  /** Small label above the H1. */
  eyebrow?: string;
  /** The page's single, logical H1. */
  title: string;
  /** Supporting intro text under the H1. */
  subtitle?: ReactNode;
  /** Optional breadcrumb trail (Home is prepended automatically). */
  breadcrumbs?: Crumb[];
  /** Optional actions (buttons) rendered under the intro. */
  actions?: ReactNode;
}

/**
 * The top-of-page hero. Renders the page's one <h1>. Calm, generous spacing;
 * no imagery yet (added once approved assets exist).
 */
export function PageHero({ eyebrow, title, subtitle, breadcrumbs, actions }: PageHeroProps) {
  return (
    <div className="border-b border-border bg-brand-soft/60">
      <PageContainer className="py-10 sm:py-14">
        {breadcrumbs && <Breadcrumbs items={breadcrumbs} className="mb-4" />}
        {eyebrow && (
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand">
            {eyebrow}
          </p>
        )}
        <h1 className="max-w-prose text-3xl sm:text-4xl lg:text-5xl text-text-primary">
          {title}
        </h1>
        {subtitle && (
          <div className="mt-4 max-w-prose text-lg leading-relaxed text-text-secondary">
            {subtitle}
          </div>
        )}
        {actions && <div className="mt-6 flex flex-wrap gap-3">{actions}</div>}
      </PageContainer>
    </div>
  );
}
