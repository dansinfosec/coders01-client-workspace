/**
 * Single source of truth voor Fix-it All bedrijfsfeiten.
 * Alle waarden zijn GEVERIFIEERD op de live site (fix-itall.nl, audit 2026-07-30),
 * tenzij gemarkeerd met `TODO: bevestigen met klant`. Nooit feiten verzinnen — onbekend = TODO/null.
 * Componenten importeren hiervandaan; niets wordt verspreid hardgecodeerd, zodat content later
 * naar een CMS/API kan verhuizen.
 */

export interface OpeningDay {
  /** Nederlandse daglabel, bijv. "Maandag". */
  day: string;
  /** 0 = zondag … 6 = zaterdag (JS getDay). */
  weekday: number;
  /** Tijdvakken als [openMinuten, sluitMinuten] vanaf middernacht; leeg = gesloten. */
  ranges: Array<[number, number]>;
}

const h = (hh: number, mm = 0) => hh * 60 + mm;

export const company = {
  name: "Autobedrijf Fix-it All",
  /** Wordmark op de gevel/logo. */
  wordmark: "FIX-IT ALL",
  /** VERIFIED — home/onderhoud: "Uw pitstop voor autokeuring, onderhoud en occasions". */
  slogan: "Uw pitstop voor autokeuring, onderhoud en occasions",
  tagline:
    "Onafhankelijke vakgarage in Utrecht sinds 2000. APK, onderhoud, uitlaat- en laswerk, airco en occasions — voor alle merken.",
  intro:
    "Fix-it All is sinds 2000 uw onafhankelijke vakgarage in Utrecht. Persoonlijke aandacht, eerlijk advies en service voor alle merken — van APK en onderhoud tot uitlaatwerk, airco, banden en occasions.",
  foundedYear: 2000,

  phone: {
    /** Vaste lijn (VERIFIED, site-breed). */
    display: "030 – 214 84 88",
    href: "tel:+31302148488",
  },
  /** Mobiel nummer (VERIFIED — occasion-detailpagina). */
  mobile: {
    display: "06 – 4210 4745",
    href: "tel:+31642104745",
  },
  email: "info@fix-itall.nl",

  address: {
    street: "Eendrachtlaan 242",
    postalCode: "3526 LB",
    city: "Utrecht",
    country: "NL",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Autobedrijf+Fix-it+All+Eendrachtlaan+242+Utrecht",
  },

  /** VERIFIED (contact/APK): Ma–Vr 08:30–18:00 · Za 08:30–17:00 · Zo gesloten. */
  openingHours: [
    { day: "Maandag", weekday: 1, ranges: [[h(8, 30), h(18)]] },
    { day: "Dinsdag", weekday: 2, ranges: [[h(8, 30), h(18)]] },
    { day: "Woensdag", weekday: 3, ranges: [[h(8, 30), h(18)]] },
    { day: "Donderdag", weekday: 4, ranges: [[h(8, 30), h(18)]] },
    { day: "Vrijdag", weekday: 5, ranges: [[h(8, 30), h(18)]] },
    { day: "Zaterdag", weekday: 6, ranges: [[h(8, 30), h(17)]] },
    { day: "Zondag", weekday: 0, ranges: [] },
  ] as OpeningDay[],

  /** Verkorte weergave voor footer/hero. */
  openingSummary: "Ma–vr 08:30–18:00 · za 08:30–17:00 · zo gesloten",

  social: {
    // Alleen Facebook is bevestigd op de huidige site.
    facebook: "https://www.facebook.com/fix.it.all.utrecht/",
  },

  /** Primair verzorgingsgebied. Overige plaatsen: TODO bevestigen (huidige site gebruikt veel
   *  dunne locatiepagina's; die nemen we niet 1-op-1 over). */
  serviceArea: ["Utrecht"],

  /** Kernvoordelen (VERIFIED van de site). */
  usps: [
    "Onafhankelijke vakgarage sinds 2000",
    "Voor alle merken",
    "Persoonlijke aandacht en eerlijk advies",
    "RDW-erkende APK-keurmeesters",
    "Leenfiets of leenscooter beschikbaar",
    "Gratis APK bij een grote onderhoudsbeurt",
  ],

  /** De enige op de site bevestigde actie. Prijzen worden verder NIET vermeld. */
  offer: {
    label: "Gratis APK bij een grote onderhoudsbeurt",
    short: "Gratis APK bij een grote beurt",
  },

  /**
   * WhatsApp-kanaal — centraal geconfigureerd (single source of truth).
   * VOORLOPIG ingesteld op het bekende mobiele nummer (06-4210 4745) op verzoek van de
   * opdrachtgever, zodat de WhatsApp-knoppen werkend getoond kunnen worden.
   * TODO: bevestigen met klant of dit nummer daadwerkelijk als WhatsApp-kanaal dient.
   * `number` = internationaal zonder plusteken (voor wa.me), `href` = kant-en-klare chatlink.
   */
  whatsapp: {
    number: "31642104745",
    display: "06 – 4210 4745",
    href: "https://wa.me/31642104745",
    provisional: true,
  } as { number: string; display: string; href: string; provisional: boolean } | null,

  // --- TODO: bevestigen met klant (niet tonen/gebruiken tot bevestigd) ---
  /** Reviewscore "4.7" staat op de eigen site maar zonder verifieerbare bron → niet tonen. */
  rating: null as { score: number; source: string; url: string } | null,
  kvk: null as string | null,
  vat: null as string | null,

  /** Leeg = frontend-only mock. Zie services/planningService + services/vehicleSaleService. */
  appointmentEndpoint: import.meta.env.VITE_APPOINTMENT_ENDPOINT ?? "",
  vehicleSaleEndpoint: import.meta.env.VITE_VEHICLE_SALE_ENDPOINT ?? "",
} as const;

export type Company = typeof company;
