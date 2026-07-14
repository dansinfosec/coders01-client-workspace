/**
 * Shared content types. All editable website content is described here and
 * populated from the typed files in `src/data/`. Keeping the shapes in one
 * place means local data can later be swapped for API/CMS data without
 * touching UI components.
 */
import type { LucideIcon } from "lucide-react";

/** A single navigation entry (used in header, footer and mobile menu). */
export interface NavItem {
  label: string;
  /** App route path, e.g. "/logeeropvang". */
  to: string;
}

/** Global site settings, contact-independent. */
export interface SiteSettings {
  /** Short brand name, e.g. "Sem & Co". */
  name: string;
  /** One-line description used as a default meta/OG description. */
  tagline: string;
  /** Full public URL of the live site (source of the redesign). */
  sourceUrl: string;
  /** Language code for <html lang> and hreflang. */
  locale: string;
  /** Default social share image path (in /public). Optional until provided. */
  defaultOgImage?: string;
}

/** A care service, shown on the home page and on its own route. */
export interface Service {
  /** Stable id / slug. */
  id: string;
  /** Route the service links to. */
  to: string;
  title: string;
  /** Short summary used on cards. */
  summary: string;
  /** Icon shown on the service card. */
  icon: LucideIcon;
  /** Longer intro paragraph(s) for the service's own page. */
  intro?: string[];
  /** Verified highlight bullets for the service page. */
  points?: string[];
  /** Whether this service is confirmed as an actual offering on the live site. */
  verified: boolean;
}

/** A step in the "how it works" (werkwijze) process. */
export interface ProcessStep {
  id: string;
  /** 1-based step number for display. */
  order: number;
  title: string;
  description: string;
}

/** A frequently asked question. */
export interface Faq {
  id: string;
  question: string;
  answer: string;
  /** Only verified FAQs are shown publicly; unverified ones stay internal. */
  verified: boolean;
}

/** A reusable call-to-action definition. */
export interface CtaContent {
  title: string;
  description: string;
  primaryLabel: string;
  primaryTo: string;
  secondaryLabel?: string;
  secondaryTo?: string;
}

/** A single highlight/feature bullet with an icon. */
export interface Highlight {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

/** Structured content for the home page. */
export interface HomeContent {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCtaLabel: string;
    primaryCtaTo: string;
    secondaryCtaLabel: string;
    secondaryCtaTo: string;
  };
  intro: {
    heading: string;
    paragraphs: string[];
  };
  highlights: Highlight[];
  forWhom: {
    heading: string;
    paragraphs: string[];
  };
  location: {
    heading: string;
    paragraphs: string[];
  };
  closingCta: CtaContent;
}

/** A titled block of paragraphs (reusable for About / service pages). */
export interface ContentBlock {
  heading: string;
  paragraphs: string[];
}

/** Structured content for the About ("Over ons") page. */
export interface AboutContent {
  intro: ContentBlock;
  approach: ContentBlock;
  smallScale: ContentBlock;
  /** Shown as a clearly-marked "to be confirmed" note (e.g. team info). */
  toConfirmNote: string;
}

/** Contact details block. Unverified channels are `null` and hidden in the UI. */
export interface ContactDetails {
  organisation: string;
  /** Location/venue name, e.g. "RCN Het Grote Bos". */
  locationName: string;
  /** null when not verified — the UI hides it rather than showing a fake value. */
  email: string | null;
  phone: string | null;
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
    /** Whether the postal address itself is verified. */
    verified: boolean;
  };
}
