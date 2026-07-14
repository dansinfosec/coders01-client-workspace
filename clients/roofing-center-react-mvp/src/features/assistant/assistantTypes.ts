export type StepKind = "options" | "text" | "textarea" | "file" | "consent";

export interface Choice {
  value: string;
  label: string;
}

export interface AssistantStep {
  id: string;
  /** Assistant prompt shown in the transcript. */
  prompt: string;
  kind: StepKind;
  choices?: Choice[];
  placeholder?: string;
  help?: string;
  optional?: boolean;
  inputMode?: "text" | "tel" | "email" | "numeric";
  autoComplete?: string;
  /** Return an error message or null. */
  validate?: (value: string) => string | null;
  /** Summary label + which section this belongs to. */
  summaryLabel: string;
}

export interface UploadMeta {
  name: string;
  size: number;
  type: string;
}

export type AssistantAnswers = Record<string, string>;

export type AssistantPhase = "welcome" | "flow" | "summary" | "success";

export interface AssistantState {
  phase: AssistantPhase;
  stepIndex: number;
  answers: AssistantAnswers;
  uploads: UploadMeta[];
  consent: boolean;
  /** When set, answering a single step returns to the summary. */
  editingReturnToSummary: boolean;
  reference: string;
}
