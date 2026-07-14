/**
 * Central, editable copy for the application form (intro screen, notices,
 * confirmation). Keeping this here means wording can change without touching
 * component logic. Labels/options for individual fields live in
 * components/forms/ApplicationForm/applicationFormConfig.ts.
 */
export const applicationFormContent = {
  intro: {
    title: "Aanmelden bij Sem & Co",
    lead:
      "Met dit formulier doe je een eerste, vrijblijvende aanmelding. Het is een eerste kennismaking — geen definitieve plaatsing.",
    points: [
      "Het formulier bestaat uit acht korte stappen.",
      "Je gegevens worden tussentijds bewaard, ook als je de pagina ververst.",
      "Aanmelden verplicht tot niets: daarna kijken we samen wat passend is.",
      "Twijfel je of dit het juiste is? Neem gerust eerst contact op.",
    ],
    startLabel: "Start de aanvraag",
  },
  crisisNotice:
    "Bij direct gevaar of een medische noodsituatie is dit formulier niet het juiste contactpunt.",
  privacyConsentLabel:
    "Ik geef toestemming om deze gegevens te gebruiken om contact met mij op te nemen over deze aanvraag.",
  accuracyConsentLabel:
    "Ik heb de gegevens naar waarheid en zo volledig mogelijk ingevuld.",
  submissionNote:
    "Het versturen van deze aanvraag bevestigt nog geen plaatsing. We nemen daarna contact met je op.",
  // No verified privacy page exists yet — placeholder link text only.
  privacyStatementNote:
    "Een definitieve privacyverklaring wordt nog toegevoegd (te bevestigen met Sem & Co).",
  confirmation: {
    title: "Bedankt voor je aanvraag",
    isDemo: "Dit is op dit moment een demoformulier — er is nog geen echte verzending gekoppeld.",
    nextSteps: [
      "Normaal gesproken nemen we na je aanmelding contact met je op.",
      "We plannen een kennismaking en bespreken rustig wat passend kan zijn.",
      "Alles gebeurt vrijblijvend en op het tempo van het kind.",
    ],
  },
  clearDraftConfirm:
    "Weet je zeker dat je het formulier wilt wissen? Je ingevulde gegevens gaan dan verloren.",
} as const;
