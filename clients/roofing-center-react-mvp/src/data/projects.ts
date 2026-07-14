export type ProjectCategory = "afgewerkt" | "uitvoering" | "inspectie";

export interface Project {
  id: string;
  base: string; // path under /images/roofing-center/ (no extension)
  w: number;
  h: number;
  alt: string;
  caption: string;
  category: ProjectCategory;
}

export const projectCategories: { value: ProjectCategory | "alle"; label: string }[] = [
  { value: "alle", label: "Alle projecten" },
  { value: "afgewerkt", label: "Afgewerkte daken" },
  { value: "uitvoering", label: "Tijdens uitvoering" },
  { value: "inspectie", label: "Inspectie & herstel" },
];

/**
 * Portfolio from the client's own photos. Captions stay generic and safe —
 * no addresses, client names, dates or before/after claims are invented.
 */
export const projects: Project[] = [
  { id: "p01", base: "projects/aanbouw-plat-dak", w: 1600, h: 1200, category: "afgewerkt",
    alt: "Strak afgewerkt plat dak op een aanbouw in een woonwijk", caption: "Plat dak op een aanbouw, strak afgewerkt" },
  { id: "p02", base: "projects/dakdoorvoer-detail", w: 1600, h: 1200, category: "afgewerkt",
    alt: "Plat dak met een waterdicht afgewerkte dakdoorvoer", caption: "Waterdicht afgewerkte dakdoorvoer" },
  { id: "p03", base: "projects/platte-daken-detailwerk", w: 1600, h: 1200, category: "afgewerkt",
    alt: "Afgewerkt plat dak met verzorgd detailwerk rond doorvoeren", caption: "Verzorgd detailwerk op een plat dak" },
  { id: "p04", base: "projects/uitbouw-dakbedekking", w: 1200, h: 1600, category: "afgewerkt",
    alt: "Nieuwe dakbedekking op een uitbouw", caption: "Nieuwe dakbedekking op een uitbouw" },
  { id: "p05", base: "projects/afgewerkt-membraandak", w: 1600, h: 1201, category: "afgewerkt",
    alt: "Afgewerkt plat dak met strakke dakbedekking", caption: "Strak afgewerkt plat dak" },
  { id: "p06", base: "projects/lichtkoepel-plat-dak", w: 1200, h: 1600, category: "afgewerkt",
    alt: "Plat dak met lichtkoepel, waterdicht afgewerkt", caption: "Plat dak met lichtkoepel" },
  { id: "p07", base: "projects/lang-plat-dak-grind", w: 1200, h: 1600, category: "afgewerkt",
    alt: "Lang plat dak met bitumen dakbedekking en grindafwerking", caption: "Lang plat dak met grindafwerking" },
  { id: "p08", base: "projects/residentieel-plat-dak", w: 1200, h: 1600, category: "afgewerkt",
    alt: "Strak afgewerkt plat dak bij een woning met blauwe lucht", caption: "Afgewerkt plat dak bij een woning" },
  { id: "p09", base: "projects/verse-bitumen", w: 1600, h: 1200, category: "uitvoering",
    alt: "Vers aangebrachte bitumen dakbedekking op een plat dak", caption: "Vers aangebrachte bitumen dakbedekking" },
  { id: "p10", base: "services/bitumen-branden", w: 1400, h: 1050, category: "uitvoering",
    alt: "Bitumen dakbedekking wordt met een brander aangebracht", caption: "Bitumen branden tijdens uitvoering" },
  { id: "p11", base: "projects/epdm-installatie", w: 1600, h: 1200, category: "uitvoering",
    alt: "Installatie van een EPDM dakbedekking op een groter plat dak", caption: "EPDM dakbedekking tijdens installatie" },
  { id: "p12", base: "projects/dakopbouw-onderlaag", w: 1200, h: 1600, category: "uitvoering",
    alt: "Opbouw van een plat dak met onderlaag en houten latten", caption: "Dakopbouw met onderlaag" },
  { id: "p13", base: "services/vakmanschap-afwerking", w: 1400, h: 1050, category: "uitvoering",
    alt: "Vakman werkt aan de waterdichte afwerking van een plat dak", caption: "Vakkundige afwerking bij een opstand" },
  { id: "p14", base: "projects/wateroverlast-inspectie", w: 1200, h: 1600, category: "inspectie",
    alt: "Inspectie van een plat dak met zichtbare wateroverlast", caption: "Inspectie bij wateroverlast" },
  { id: "p15", base: "services/dakinspectie-bestaand", w: 1400, h: 1050, category: "inspectie",
    alt: "Beoordeling van een verouderd plat dak", caption: "Beoordeling van een bestaand dak" },
  { id: "p16", base: "services/dakschade-inspectie", w: 1200, h: 1600, category: "inspectie",
    alt: "Inspectie van een plat dak met zichtbare schade in de dakbedekking", caption: "Inspectie van dakschade" },
];
