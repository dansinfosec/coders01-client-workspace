import type { AboutContent } from "@/types/content";

/**
 * "Over ons" content. Verified from the live site where possible. The live
 * /over-ons page body is JS-rendered (not captured), and no team/qualification
 * details are confirmed — so none are invented. Team info is flagged to confirm.
 */
export const aboutContent: AboutContent = {
  intro: {
    heading: "Wie we zijn",
    paragraphs: [
      "Sem & Co is een warme en huiselijke logeerplek voor kinderen en jongeren van 4 tot 18 jaar met extra ondersteuningsbehoeften. We verblijven op vakantiepark RCN Het Grote Bos in Doorn.",
      "We nemen alleen kinderen aan als we de begeleiding veilig, passend en met de juiste aandacht kunnen bieden. We nemen de tijd om jullie goed te leren kennen, zodat het echt past.",
    ],
  },
  approach: {
    heading: "Onze aanpak",
    paragraphs: [
      "We kijken naar het kind: naar het prikkelprofiel, de ontwikkelingsleeftijd en wat een kind aankan. Zo kunnen we kinderen beter plaatsen in een groep die bij hen past.",
      "Het ene kind heeft vooral behoefte aan voorspelbaarheid en ontprikkelen, het andere zoekt uitdaging en contact. We sluiten aan op de ontwikkeling en behoefte van ieder kind.",
    ],
  },
  smallScale: {
    heading: "Bewust kleinschalig",
    paragraphs: [
      "Per bungalow logeren maximaal vijf kinderen, verdeeld over vier bungalows. Minder prikkels, meer rust en meer echte aandacht.",
      "Geen grote groep waarin iedereen zich moet aanpassen. We houden de groep overzichtelijk, zodat we veiligheid en structuur kunnen bieden.",
    ],
  },
  toConfirmNote:
    "Informatie over het team, functies en kwalificaties is nog niet publiek geverifieerd en wordt daarom (nog) niet getoond. Deze wordt toegevoegd na bevestiging door Sem & Co.",
};
