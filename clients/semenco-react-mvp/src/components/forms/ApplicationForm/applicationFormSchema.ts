import { z } from "zod";

/**
 * Zod schema for the 8-step application form. Selection fields are stored as
 * strings ("" = not chosen) so the form starts blank and validates per step.
 * Conditional requirements (applicant type, crisis, funding) are enforced in
 * superRefine. Deliberately light on sensitive/medical detail for this MVP.
 */
export const applicationFormSchema = z
  .object({
    // Step 1 — type of request
    requestType: z.string().min(1, "Maak een keuze."),

    // Step 2 — who is filling in the form
    applicantType: z.string().min(1, "Maak een keuze."),
    applicantRelation: z.string().max(120, "Maximaal 120 tekens."), // parent/guardian
    organisation: z.string().max(160, "Maximaal 160 tekens."), // professional
    role: z.string().max(120, "Maximaal 120 tekens."), // professional

    // Step 3 — contact details
    fullName: z.string().min(1, "Vul je naam in."),
    email: z.string().min(1, "Vul je e-mailadres in.").email("Vul een geldig e-mailadres in."),
    phone: z.string().min(1, "Vul een telefoonnummer in."),
    contactMethod: z.string().min(1, "Maak een keuze."),
    contactTime: z.string().max(160, "Maximaal 160 tekens."),

    // Step 4 — about the child / young person (minimal)
    childFirstName: z.string().min(1, "Vul de voornaam in."),
    childAge: z.string().min(1, "Vul een leeftijd of geboortejaar in.").max(40),
    childMunicipality: z.string().min(1, "Vul een gemeente of woonplaats in."),
    childDaytime: z.string().max(200, "Maximaal 200 tekens."), // optional

    // Step 5 — support request
    supportAreas: z.array(z.string()).min(1, "Kies minimaal één onderwerp."),
    supportImportant: z.string().max(1000, "Maximaal 1000 tekens."), // optional

    // Step 6 — current care & referral
    currentSupport: z.string().min(1, "Maak een keuze."),
    hasReferrer: z.string().min(1, "Maak een keuze."),
    funding: z.string().min(1, "Maak een keuze."),
    requestUrgency: z.string().min(1, "Maak een keuze."),

    // Step 7 — preferences & practical
    preferredStart: z.string().max(200, "Maximaal 200 tekens."), // optional
    relevantPeriods: z.string().max(200, "Maximaal 200 tekens."), // optional
    wantIntroTalk: z.string().max(20), // "yes" | "no" | ""
    crisisSituation: z.string().max(600, "Maximaal 600 tekens."), // crisis only, optional
    comments: z.string().max(1000, "Maximaal 1000 tekens."), // optional

    // Step 8 — review & consent
    consentPrivacy: z.boolean().refine((v) => v === true, {
      message: "Geef toestemming om de aanvraag te versturen.",
    }),
    consentAccurate: z.boolean().refine((v) => v === true, {
      message: "Bevestig dat de gegevens naar waarheid zijn ingevuld.",
    }),
  })
  .superRefine((data, ctx) => {
    if (data.applicantType === "parent" && data.applicantRelation.trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["applicantRelation"],
        message: "Vul je relatie tot het kind in.",
      });
    }
    if (data.applicantType === "professional") {
      if (data.organisation.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["organisation"],
          message: "Vul de organisatie in.",
        });
      }
      if (data.role.trim().length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["role"],
          message: "Vul je functie of rol in.",
        });
      }
    }
  });

export type ApplicationFormValues = z.infer<typeof applicationFormSchema>;

export const applicationFormDefaults: ApplicationFormValues = {
  requestType: "",
  applicantType: "",
  applicantRelation: "",
  organisation: "",
  role: "",
  fullName: "",
  email: "",
  phone: "",
  contactMethod: "",
  contactTime: "",
  childFirstName: "",
  childAge: "",
  childMunicipality: "",
  childDaytime: "",
  supportAreas: [],
  supportImportant: "",
  currentSupport: "",
  hasReferrer: "",
  funding: "",
  requestUrgency: "",
  preferredStart: "",
  relevantPeriods: "",
  wantIntroTalk: "",
  crisisSituation: "",
  comments: "",
  consentPrivacy: false,
  consentAccurate: false,
};
