/**
 * Centrale asset-mapping — alle beeldpaden op één plek (geen verspreide hardcoded paden).
 * Beelden staan in /public en worden via Vite als publieke URL geserveerd.
 *
 * De dienstbeelden onder /assets/generated/services/ zijn **AI-gegenereerde, illustratieve**
 * werkplaatsbeelden (Higgsfield, model nano_banana; 16:9). Geen echte foto's van het team of pand.
 * Zie docs/GENERATED-ASSETS.md. De hero en auto-verkopensectie gebruiken echte pandfoto's.
 */
export const assets = {
  /** Homepage-hero — echte gevelfoto van het pand (met graphite-overlay). */
  heroWorkshop: "/assets/general/werkplaats-gevel.jpg",
  /** "Auto verkopen"-sectie — echte forecourt-foto. */
  autoVerkopen: "/assets/general/forecourt.jpg",
} as const;

/**
 * Hero-afbeelding per dienst (slug → pad in /public, of `null` als een bestand echt ontbreekt).
 * Illustratieve AI-beelden, consistente Europese werkplaatsstijl.
 */
export const serviceImage: Record<string, string | null> = {
  "apk-keuring": "/assets/generated/services/apk-keuring.webp",
  onderhoud: "/assets/generated/services/auto-onderhoud.webp",
  "kleine-beurt": "/assets/generated/services/kleine-beurt.webp",
  "grote-beurt": "/assets/generated/services/grote-beurt.webp",
  "uitlaat-laswerk": "/assets/generated/services/uitlaat-laswerk.webp",
  "airco-service": "/assets/generated/services/aircoservice.webp",
  bandenservice: "/assets/generated/services/bandenservice.webp",
  reparatie: "/assets/generated/services/reparatie.webp",
  diagnose: "/assets/generated/services/diagnose.webp",
};

export const getServiceImage = (slug: string): string | null => serviceImage[slug] ?? null;

/** Neutrale, eerlijke alt-tekst voor de illustratieve dienstbeelden. */
export const serviceImageAlt = (label: string): string => `Illustratieve werkplaatsomgeving — ${label}`;
