// ---------------------------------------------------------------------------
// COMPANY DATA — single source of truth for HK Vastgoed & Onderhoud.
//
// All content lives in these /data files so it can later be swapped for a
// Django API or a CMS without touching the components.
//
// VERIFIED = taken directly from the client's existing public website
//            (crawled into clients/hk-vastgoed/scraped/).
// PLACEHOLDER = clearly-marked demo content; must be confirmed with the client
//               before go-live. Search this folder for `PLACEHOLDER` / `isPlaceholder`.
// ---------------------------------------------------------------------------

export const company = {
  name: 'HK Vastgoed & Onderhoud',
  shortName: 'HK Vastgoed',
  // VERIFIED — tagline based on the site's own home meta description.
  tagline: 'Uw betrouwbare dakdekker voor reparatie, renovatie en onderhoud',
  // VERIFIED — stated on /over-ons ("Al meer dan 25 jaar staan wij klaar").
  experienceLabel: 'Al meer dan 25 jaar vakmanschap',

  // VERIFIED contact details (from scraped pages).
  // tel: uses the international E.164 format for reliable dialing on mobile.
  phone: {
    display: '085 - 060 0397',
    international: '+31 85 060 0397',
    href: 'tel:+31850600397',
  },
  email: 'info@hk-vastgoedonderhoud.nl',

  // WhatsApp — ENABLED. Justification: the client's existing website has a
  // configured WhatsApp chat widget on every page (a "Let's chat on WhatsApp"
  // popup pointing at wa.me/850600397), so WhatsApp is a real client channel —
  // this is NOT inferred from the phone number alone. The original link was
  // missing the country code; the corrected, client-verified link is used here.
  whatsapp: {
    enabled: true,
    display: '+31 85 060 0397',
    href: 'https://wa.me/31850600397',
  },

  // VERIFIED — three vestigingen listed across the site.
  locations: [
    { label: 'Hoofdvestiging', street: 'Koningsweg 1', postcode: '3762 EA', city: 'Soest' },
    { label: 'Vestiging Haarlem', street: 'Kennemerplein 6 - 14', postcode: '2011 MJ', city: 'Haarlem' },
    { label: 'Vestiging Amsterdam', street: 'Beethovenstraat 505', postcode: '1083 HK', city: 'Amsterdam' },
  ],

  // VERIFIED — certificates referenced in the service-page hero blocks
  // ("VCA Dakdekker + Kwaliteitsvakman Certificeerd") and a "Certificaten"
  // section. Displayed as stated; confirm exact wording/logos with the client.
  certifications: ['VCA-gecertificeerd dakdekker', 'Kwaliteitsvakman gecertificeerd'],

  // VERIFIED — promise repeated across the site.
  responsePromise: 'Vrijblijvend & binnen 24 uur reactie',

  // Service region — the cities of the three vestigingen and surroundings.
  // VERIFIED cities; wording is editorial. Confirm the full coverage area.
  serviceArea: ['Soest', 'Haarlem', 'Amsterdam', 'Het Gooi', 'Utrecht e.o.', 'Noord-Holland'],

  // NOTE: no other social profiles (Facebook/Instagram/LinkedIn) were reliably
  // found in the crawled content. WhatsApp is handled via `whatsapp` above.
  social: {},
}

// Trust points shown in the hero / trust bar. VERIFIED — these are the bullet
// points from the site's service-page hero.
export const trustPoints = [
  'Gratis & vrijblijvende dakinspectie',
  'Duidelijke kostenindicatie vooraf',
  'Eerlijke risico-inschatting — geen verrassingen achteraf',
  'VCA & Kwaliteitsvakman gecertificeerd',
]

// "Why choose us" — distilled from the site's own copy (VERIFIED themes).
export const reasons = [
  {
    title: 'Persoonlijke aanpak',
    body: 'Geen enkel dak is hetzelfde. We nemen de tijd om mee te denken en geven advies dat écht bij uw situatie past.',
  },
  {
    title: 'Transparant en eerlijk',
    body: 'Een heldere offerte zonder kleine lettertjes. U weet vooraf waar u aan toe bent — geen verrassingen achteraf.',
  },
  {
    title: 'Duurzame materialen',
    body: 'We combineren jarenlange ervaring met moderne technieken en materialen die lang meegaan.',
  },
  {
    title: 'Complete service',
    body: 'Van inspectie en advies tot uitvoering en nazorg. We leveren pas op als u tevreden bent.',
  },
  {
    title: 'Snel bij spoed',
    body: 'Stormschade of acute lekkage? We zijn snel ter plaatse om verdere schade te beperken.',
  },
  {
    title: 'Hulp bij verzekering',
    body: 'Bij schade helpen we met een duidelijk rapport of schadeverklaring voor uw verzekeraar.',
  },
]
