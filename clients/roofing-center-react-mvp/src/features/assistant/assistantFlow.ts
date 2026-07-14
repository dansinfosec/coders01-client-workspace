import type { AssistantStep } from "./assistantTypes";

const required = (msg: string) => (v: string) => (v.trim().length === 0 ? msg : null);
const postcode = (v: string) => (/^\d{4}\s?[a-zA-Z]{2}$/.test(v.trim()) ? null : "Vul een geldige postcode in (bijv. 1311 AB).");
const phone = (v: string) => {
  const digits = v.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15 ? null : "Vul een geldig telefoonnummer in.";
};
const emailOpt = (v: string) => {
  if (v.trim().length === 0) return null;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? null : "Vul een geldig e-mailadres in.";
};

/**
 * Guided conversation steps (after the welcome choice, which sets `issue`).
 * This is a structured lead flow — NOT a fake "intelligent" LLM.
 */
export const flowSteps: AssistantStep[] = [
  {
    id: "leak",
    prompt: "Is er op dit moment sprake van actieve lekkage?",
    kind: "options",
    choices: [
      { value: "ja", label: "Ja, het lekt nu" },
      { value: "nee", label: "Nee" },
      { value: "onbekend", label: "Weet ik niet zeker" },
    ],
    summaryLabel: "Actieve lekkage",
    validate: required("Maak een keuze."),
  },
  {
    id: "started",
    prompt: "Wanneer is het probleem ongeveer begonnen?",
    kind: "options",
    choices: [
      { value: "deze-week", label: "Deze week" },
      { value: "weken", label: "Enkele weken geleden" },
      { value: "langer", label: "Langer geleden" },
      { value: "onbekend", label: "Weet ik niet" },
    ],
    summaryLabel: "Begonnen",
    validate: required("Maak een keuze."),
  },
  {
    id: "description",
    prompt: "Kunt u kort omschrijven wat er speelt?",
    kind: "textarea",
    placeholder: "Bijvoorbeeld: vochtplek op het plafond onder het platte dak van de aanbouw.",
    help: "Deel geen gevoelige persoonsgegevens.",
    summaryLabel: "Omschrijving",
    validate: (v) => (v.trim().length < 5 ? "Geef een korte omschrijving." : null),
  },
  {
    id: "postcode",
    prompt: "Wat is de postcode van het adres?",
    kind: "text",
    placeholder: "1311 AB",
    inputMode: "text",
    autoComplete: "postal-code",
    summaryLabel: "Postcode",
    validate: postcode,
  },
  {
    id: "place",
    prompt: "In welke plaats bevindt het dak zich?",
    kind: "text",
    placeholder: "Almere",
    autoComplete: "address-level2",
    summaryLabel: "Plaats",
    validate: required("Vul een plaats in."),
  },
  {
    id: "contactPref",
    prompt: "Hoe nemen we het liefst contact met u op?",
    kind: "options",
    choices: [
      { value: "bellen", label: "Bellen" },
      { value: "whatsapp", label: "WhatsApp" },
      { value: "email", label: "E-mail" },
    ],
    summaryLabel: "Contactvoorkeur",
    validate: required("Maak een keuze."),
  },
  {
    id: "name",
    prompt: "Wat is uw naam?",
    kind: "text",
    placeholder: "Voor- en achternaam",
    autoComplete: "name",
    summaryLabel: "Naam",
    validate: required("Vul uw naam in."),
  },
  {
    id: "phone",
    prompt: "Op welk telefoonnummer kunnen we u bereiken?",
    kind: "text",
    placeholder: "06 12345678",
    inputMode: "tel",
    autoComplete: "tel",
    summaryLabel: "Telefoon",
    validate: phone,
  },
  {
    id: "email",
    prompt: "Wat is uw e-mailadres? (optioneel)",
    kind: "text",
    placeholder: "naam@voorbeeld.nl",
    inputMode: "email",
    autoComplete: "email",
    optional: true,
    summaryLabel: "E-mail",
    validate: emailOpt,
  },
  {
    id: "photos",
    prompt: "Wilt u foto's van het dak toevoegen? Dat helpt ons bij de beoordeling. (optioneel)",
    kind: "file",
    optional: true,
    help: "In deze demo worden alleen bestandsnamen bewaard; er worden geen bestanden verzonden.",
    summaryLabel: "Foto's",
  },
  {
    id: "consent",
    prompt: "Mogen wij uw gegevens gebruiken om contact met u op te nemen over deze aanvraag?",
    kind: "consent",
    summaryLabel: "Toestemming",
    validate: (v) => (v === "true" ? null : "Toestemming is nodig om door te gaan."),
  },
];

export const issueLabels: Record<string, string> = {
  lekkage: "Mijn platte dak lekt",
  vervangen: "Dakbedekking vervangen",
  inspectie: "Dakinspectie",
  onderhoud: "Onderhoud",
  renovatie: "Renovatie",
  offerte: "Offerte aanvragen",
};

export const choiceLabel = (step: AssistantStep, value: string): string =>
  step.choices?.find((c) => c.value === value)?.label ?? value;
