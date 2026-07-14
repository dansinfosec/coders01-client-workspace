import type { LucideIcon } from "lucide-react";
import type { ApplicationFormValues } from "./applicationFormSchema";

/** Request types offered as large selectable cards in step 1. */
export type RequestType =
  | "overnight"
  | "holiday"
  | "crisis"
  | "introduction"
  | "information"
  | "other";

export interface RequestTypeOption {
  id: RequestType;
  label: string;
  description: string;
  icon: LucideIcon;
}

/** Who is filling in the form (step 2). */
export type ApplicantType = "parent" | "professional" | "other";

export interface ApplicantTypeOption {
  id: ApplicantType;
  label: string;
  description: string;
  icon: LucideIcon;
}

/** A simple value/label option (radios, checkboxes). */
export interface Option {
  value: string;
  label: string;
  description?: string;
}

/** Identifier for each step. */
export type StepId =
  | "requestType"
  | "applicant"
  | "contact"
  | "child"
  | "support"
  | "care"
  | "preferences"
  | "review";

export interface StepDefinition {
  id: StepId;
  /** Short title shown in the progress indicator. */
  title: string;
  /** Longer heading shown at the top of the step. */
  heading: string;
  /** Optional helper text under the heading. */
  intro?: string;
  /** Fields validated when leaving this step (empty for the review step). */
  fields: (keyof ApplicationFormValues)[];
}
