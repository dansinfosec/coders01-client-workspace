import {
  Baby,
  Briefcase,
  HelpCircle,
  Info,
  LifeBuoy,
  Moon,
  MoreHorizontal,
  Sun,
  Users,
} from "lucide-react";
import type {
  ApplicantTypeOption,
  Option,
  RequestTypeOption,
  StepDefinition,
} from "./applicationFormTypes";

/** Step 1 — request types as large selectable cards. Verified offerings + intake. */
export const requestTypeOptions: RequestTypeOption[] = [
  { id: "overnight", label: "Logeeropvang", description: "Logeerweekenden in een bungalow.", icon: Moon },
  { id: "holiday", label: "Vakantieopvang", description: "Een vakantieweek met rust en ritme.", icon: Sun },
  { id: "crisis", label: "Crisisopvang", description: "Tijdelijke opvang, maximaal vier weken.", icon: LifeBuoy },
  { id: "introduction", label: "Kennismaking", description: "Een vrijblijvend kennismakingsgesprek.", icon: Users },
  { id: "information", label: "Informatie", description: "Meer weten over de mogelijkheden.", icon: Info },
  { id: "other", label: "Anders", description: "Iets anders of nog niet zeker.", icon: MoreHorizontal },
];

/** Step 2 — who is filling in the form. */
export const applicantTypeOptions: ApplicantTypeOption[] = [
  { id: "parent", label: "Ouder of verzorger", description: "Je vraagt aan voor je eigen kind.", icon: Baby },
  { id: "professional", label: "Professionele verwijzer", description: "Je verwijst namens een organisatie.", icon: Briefcase },
  { id: "other", label: "Anders", description: "Bijvoorbeeld familie of bekende.", icon: HelpCircle },
];

export const contactMethodOptions: Option[] = [
  { value: "email", label: "Per e-mail" },
  { value: "phone", label: "Telefonisch" },
];

/** Step 5 — general support areas (first picture only). */
export const supportAreaOptions: Option[] = [
  { value: "structure", label: "Structuur en voorspelbaarheid" },
  { value: "communication", label: "Ondersteuning bij communicatie" },
  { value: "social", label: "Ondersteuning bij sociaal contact" },
  { value: "daily", label: "Ondersteuning bij dagelijkse activiteiten" },
  { value: "calm", label: "Behoefte aan rust of prikkelarme momenten" },
  { value: "one_to_one", label: "Mogelijk 1-op-1 begeleiding" },
  { value: "behaviour", label: "Mogelijk ondersteuning bij gedrag" },
  { value: "other", label: "Anders" },
];

export const yesNoUnknownOptions: Option[] = [
  { value: "yes", label: "Ja" },
  { value: "no", label: "Nee" },
  { value: "unknown", label: "Weet ik niet" },
];

/** Funding — neutral wording (site-verified schemes are named in the care page). */
export const fundingOptions: Option[] = [
  { value: "arranged", label: "Al geregeld" },
  { value: "in_progress", label: "Aanvraag loopt" },
  { value: "not_yet", label: "Nog niet geregeld" },
  { value: "unsure", label: "Ik weet het niet zeker" },
];

export const urgencyOptions: Option[] = [
  { value: "exploratory", label: "Oriënterend" },
  { value: "time_sensitive", label: "Op korte termijn" },
];

export const wantIntroOptions: Option[] = [
  { value: "yes", label: "Ja, graag een kennismakingsgesprek" },
  { value: "no", label: "Niet per se" },
];

/** Ordered step definitions. `fields` drives per-step validation. */
export const applicationSteps: StepDefinition[] = [
  {
    id: "requestType",
    title: "Aanvraag",
    heading: "Waar gaat je aanvraag over?",
    fields: ["requestType"],
  },
  {
    id: "applicant",
    title: "Wie",
    heading: "Wie vult het formulier in?",
    fields: ["applicantType", "applicantRelation", "organisation", "role"],
  },
  {
    id: "contact",
    title: "Contact",
    heading: "Contactgegevens",
    intro: "Zo kunnen we contact met je opnemen over deze aanvraag.",
    fields: ["fullName", "email", "phone", "contactMethod", "contactTime"],
  },
  {
    id: "child",
    title: "Kind",
    heading: "Over het kind of de jongere",
    intro: "Alleen enkele algemene gegevens. Geen BSN, paspoort- of verzekeringsnummers.",
    fields: ["childFirstName", "childAge", "childMunicipality", "childDaytime"],
  },
  {
    id: "support",
    title: "Ondersteuning",
    heading: "Ondersteuningsvraag",
    intro: "Dit geeft ons een eerste, algemeen beeld. Geen medische dossiers nodig.",
    fields: ["supportAreas", "supportImportant"],
  },
  {
    id: "care",
    title: "Zorg",
    heading: "Huidige zorg en verwijzing",
    fields: ["currentSupport", "hasReferrer", "funding", "requestUrgency"],
  },
  {
    id: "preferences",
    title: "Voorkeuren",
    heading: "Voorkeuren en praktische informatie",
    fields: ["preferredStart", "relevantPeriods", "wantIntroTalk", "crisisSituation", "comments"],
  },
  {
    id: "review",
    title: "Controle",
    heading: "Controleren en versturen",
    fields: [],
  },
];
