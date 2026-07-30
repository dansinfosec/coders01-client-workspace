/**
 * Site-configuratie — naam, domein, taal en SEO-defaults.
 *
 * Bedrijfsféiten (adres, telefoon, openingstijden) staan in `data/company.ts`;
 * visuele identiteit in `config/brand.ts`; modules in `config/features.ts`.
 * Deze module bundelt wat de <SEO>-component en structured data nodig hebben.
 */
import { company } from "@/data/company";

export const site = {
  /** Volledige bedrijfsnaam (afgeleid uit company). */
  name: company.name,

  /**
   * Live domein — gebruikt voor canonical-URL's en absolute JSON-LD-URL's.
   * TODO: bevestig het definitieve domein met de klant.
   */
  url: "https://www.example.com",

  /** ISO-taalcode voor <html lang> en OG-locale. */
  lang: "nl",
  locale: "nl-NL",

  /** Kleur van de mobiele browserbalk (moet matchen met brand.dark). */
  themeColor: "#16181D",

  /** Standaard <title> voor de homepage / fallback. */
  defaultTitle: `${company.name} — APK, onderhoud & occasions`,

  /** Standaard meta-description als een pagina er geen meegeeft. */
  defaultDescription: company.tagline,

  /** Optionele standaard OG-afbeelding (pad in /public). null = geen. */
  defaultOgImage: null as string | null,

  /**
   * Bouwt de volledige <title>. Een pagina mag de merknaam weglaten; die wordt
   * toegevoegd, tenzij al aanwezig.
   */
  formatTitle(title: string): string {
    return title.includes(company.name) ? title : `${title} | ${company.name}`;
  },
} as const;
