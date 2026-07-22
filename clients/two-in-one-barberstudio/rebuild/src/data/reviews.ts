/**
 * Reviews — REAL Google Maps reviews from the verified Two in one barberstudio
 * listing (rating 5.0 / 45). Text is verbatim; nothing fabricated. Up to 5 are
 * returned by the Places API.
 */
export interface Review {
  author: string;
  rating: number;
  text: string;
  timeAgo: string;
}

export const reviews: Review[] = [
  {
    author: "Djaga Droom",
    rating: 5,
    text: "Altijd netjes, netjes op tijd, nette zaak, strak kapsel. Al 12 jaar vaste klant, nooit teleurgesteld, altijd goeie service. Zeker een aanrader!!!",
    timeAgo: "6 maanden geleden",
  },
  {
    author: "Berkay Bicer",
    rating: 5,
    text: "Mijn eigen kapper had geen plek, dus ben ik hier langs geweest omdat het ook lekker dichtbij was. Al met al een top ervaring gehad. Zeer tevreden met mijn kapsel, en de kappers waren super vriendelijk. Zeker een aanrader!",
    timeAgo: "5 maanden geleden",
  },
  {
    author: "shairon coffie",
    rating: 5,
    text: "Al lang mijn kapper voor mij en mijn zoontje. Altijd beleefd en netjes met de tijden 👌🏽",
    timeAgo: "6 maanden geleden",
  },
  {
    author: "Eric Beckman Lapre",
    rating: 4,
    text: "Geweldige vriendelijke kapper en knipt mij al jaren naar meer dan tevredenheid. Zeker proberen — 100% geen spijt.",
    timeAgo: "6 maanden geleden",
  },
];
