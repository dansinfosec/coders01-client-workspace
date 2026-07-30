/**
 * Centrale asset-mapping — alle beeldpaden op één plek (geen verspreide hardcoded paden).
 * Beelden staan in /public en worden via Vite als publieke URL geserveerd.
 *
 * BELANGRIJK: er zijn (nog) GEEN AI-gegenereerde beelden — beeldgeneratie was niet beschikbaar
 * (betaald plan vereist). De hero en auto-verkopensectie gebruiken echte foto's van het pand.
 * Dienstfoto's ontbreken; `serviceImage[slug]` is daarom `null` → de UI toont een nette graphite
 * fallback in plaats van een leeg/zwart vlak. Zie docs/GENERATED-ASSETS.md.
 */
export const assets = {
  /** Homepage-hero — echte gevelfoto van het pand (met graphite-overlay). */
  heroWorkshop: "/assets/general/werkplaats-gevel.jpg",
  /** "Auto verkopen"-sectie — echte forecourt-foto. */
  autoVerkopen: "/assets/general/forecourt.jpg",
} as const;

/**
 * Optionele hero-afbeelding per dienst (slug → pad in /public, of `null`).
 * Vul aan zodra er echte of gegenereerde dienstfoto's zijn onder
 * `public/assets/generated/services/`. `null` = graphite fallback.
 */
export const serviceImage: Record<string, string | null> = {
  "apk-keuring": null,
  onderhoud: null,
  "kleine-beurt": null,
  "grote-beurt": null,
  "uitlaat-laswerk": null,
  "airco-service": null,
  bandenservice: null,
  reparatie: null,
  diagnose: null,
};

export const getServiceImage = (slug: string): string | null => serviceImage[slug] ?? null;
