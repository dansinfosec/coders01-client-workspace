import { Link } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { footerNavigation } from "@/data/navigation";
import { siteSettings } from "@/data/siteSettings";
import { imageAssets } from "@/data/imageAssets";
import { contactDetails } from "@/data/contactDetails";

/** Site footer: brand, quick links and (unverified) contact summary. */
export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t-2 border-brand bg-surface-muted">
      <PageContainer className="py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <img
              src={imageAssets.logo.src}
              alt={siteSettings.name}
              width={imageAssets.logo.width}
              height={imageAssets.logo.height}
              className="h-12 w-auto"
              loading="lazy"
            />
            <p className="mt-3 max-w-xs text-sm text-text-secondary">
              {siteSettings.tagline}
            </p>
          </div>

          <nav aria-label="Footernavigatie">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
              Navigatie
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {footerNavigation.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="rounded text-sm text-text-primary hover:text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-text-secondary">
              Contact
            </h2>
            <address className="mt-3 flex flex-col gap-1 text-sm not-italic text-text-secondary">
              <span>{contactDetails.organisation} — {contactDetails.locationName}</span>
              <span>{contactDetails.address.street}</span>
              <span>
                {contactDetails.address.postalCode} {contactDetails.address.city}
              </span>
              {contactDetails.email && (
                <a href={`mailto:${contactDetails.email}`} className="hover:text-brand hover:underline">
                  {contactDetails.email}
                </a>
              )}
              {contactDetails.phone && (
                <a
                  href={`tel:${contactDetails.phone.replace(/\s|\(|\)/g, "")}`}
                  className="hover:text-brand hover:underline"
                >
                  {contactDetails.phone}
                </a>
              )}
            </address>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-sm text-text-secondary">
          <p>
            &copy; {year} {siteSettings.name}. Voorbeeld-scaffold — nog geen
            definitieve inhoud.
          </p>
        </div>
      </PageContainer>
    </footer>
  );
}
