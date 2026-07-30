/**
 * Feature flags — één centrale plek om modules aan/uit te zetten per klant.
 *
 * Zet een vlag op `false` en de bijbehorende route, navigatielink, footerlink en
 * CTA's verdwijnen automatisch (geen dode links). Zie `routes/AppRoutes.tsx` en
 * `data/navigation.ts` voor de afhandeling.
 *
 * Kan later ook uit env of een CMS komen; houd de vorm (boolean per key) gelijk.
 */
export interface FeatureFlags {
  /** Occasions-overzicht + detailpagina's. */
  occasions: boolean;
  /** Online afspraakmodule (kalender, tijdsloten). */
  appointments: boolean;
  /** "Auto verkopen"-flow met foto-upload. */
  vehicleSale: boolean;
  /** Vacatures / open sollicitatie. */
  vacancies: boolean;
  /** WhatsApp-knoppen en -links. */
  whatsapp: boolean;
  /** RDW-kentekencheck in de afspraakflow. */
  rdwCheck: boolean;
  /** Toon zichtbare demo-/mock-disclaimers bij nog niet-echte functionaliteit. */
  demoDisclaimers: boolean;
}

export const features: FeatureFlags = {
  occasions: true,
  appointments: true,
  vehicleSale: true,
  vacancies: true,
  // Standaard uit: pas aan zodra er een geverifieerd WhatsApp-nummer in brand/company staat.
  whatsapp: false,
  rdwCheck: true,
  // Template = demo tot een backend gekoppeld is. Zet uit bij een echte, gekoppelde klantsite.
  demoDisclaimers: true,
};

/** Handige helper voor conditionele rendering: `isEnabled("occasions")`. */
export const isEnabled = (flag: keyof FeatureFlags): boolean => features[flag];
