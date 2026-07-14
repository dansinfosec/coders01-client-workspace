import { company } from "@/data/company";

/** Business-facing configuration for the Dakassistent (Dutch, public copy). */
export const assistantConfig = {
  name: "Roofing Center Dakassistent",
  welcome: "Welkom bij Roofing Center. Waarmee kunnen we u helpen?",
  welcomeOptions: [
    { value: "lekkage", label: "Mijn platte dak lekt" },
    { value: "vervangen", label: "Mijn dakbedekking moet worden vervangen" },
    { value: "inspectie", label: "Ik wil mijn dak laten inspecteren" },
    { value: "onderhoud", label: "Ik wil onderhoud laten uitvoeren" },
    { value: "renovatie", label: "Ik wil informatie over renovatie" },
    { value: "offerte", label: "Ik wil een offerte aanvragen" },
  ],
  // Disclaimer — the assistant never diagnoses with certainty.
  assessmentNote:
    "Op basis van uw antwoorden kan Roofing Center de aanvraag beoordelen. Een definitief advies is pas mogelijk na inspectie.",
  leakNote:
    "Bij een actieve lekkage is het verstandig om ook direct telefonisch of via WhatsApp contact op te nemen, zodat we snel met u kunnen meedenken.",
  intro: `Ik stel u een paar korte vragen over uw platte dak. Zo kan ${company.name} uw aanvraag goed beoordelen. Dit is een demo-assistent; uw gegevens worden nu niet verzonden.`,
  successTitle: "Bedankt voor uw aanvraag",
  successBody:
    "Uw aanvraag is verzameld (demo). In de definitieve website ontvangt Roofing Center uw gegevens en nemen we contact met u op. Er is nu nog geen echte verzending gekoppeld.",
} as const;
