/**
 * Service area — the current site does NOT state which towns/regions All-in
 * serves. Only the base location is known from the address (Honselersdijk, in
 * the municipality of Westland — a geographic fact, not a business claim).
 *
 * We must NOT invent a coverage list. `towns` stays empty until Borre confirms
 * the actual werkgebied; the UI shows the base location and an honest note.
 * See docs/NEXT-ACTIONS.md.
 */
export const serviceArea = {
  base: {
    city: "Honselersdijk",
    municipality: "Westland",
  },
  /** TODO: Confirm with client — exact towns/regions served. */
  towns: [] as string[],
  note: "Ons werkgebied bevestigen wij graag met u. Bel of app gerust om te vragen of wij bij u in de buurt werken.",
} as const;
