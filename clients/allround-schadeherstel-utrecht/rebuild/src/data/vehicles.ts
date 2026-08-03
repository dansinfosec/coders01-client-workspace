export type VehicleIconKey = "car" | "motor" | "scooter" | "boat";

export interface VehicleCategory {
  key: VehicleIconKey;
  title: string;
  description: string;
}

/**
 * The four vehicle types the business repairs (confirmed by the owner brief).
 * Descriptions stay general and credible — no specific techniques, warranties or
 * turnaround promises are invented.
 */
export const vehicleCategories: VehicleCategory[] = [
  {
    key: "car",
    title: "Autoschade",
    description:
      "Van kleine parkeerschade en deuken tot grotere plaat- en carrosserieschade. " +
      "We beoordelen de schade en bespreken welke herstelaanpak passend is.",
  },
  {
    key: "motor",
    title: "Motorschade",
    description:
      "Schade aan motoren, van cosmetische beschadigingen aan kappen en onderdelen " +
      "tot herstel en afwerking. Vraag naar de mogelijkheden voor uw motor.",
  },
  {
    key: "scooter",
    title: "Scooterschade",
    description:
      "Beschadigde scooterpanelen, krassen of schade na een valpartij? " +
      "We bekijken wat er nodig is om uw scooter weer netjes te maken.",
  },
  {
    key: "boat",
    title: "Bootschade",
    description:
      "Cosmetisch herstel en afwerking van kleinere schade aan de bootromp. " +
      "Laat de schade beoordelen en bespreek de opties.",
  },
];
