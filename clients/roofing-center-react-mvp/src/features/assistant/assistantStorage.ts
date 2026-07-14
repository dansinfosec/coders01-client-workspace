import type { AssistantState } from "./assistantTypes";

const KEY = "roofing-center:assistant";

export const initialAssistantState: AssistantState = {
  phase: "welcome",
  stepIndex: 0,
  answers: {},
  uploads: [],
  consent: false,
  editingReturnToSummary: false,
  reference: "",
};

/** Load a saved (non-submitted) conversation from sessionStorage. */
export function loadAssistantState(): AssistantState {
  if (typeof window === "undefined") return initialAssistantState;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return initialAssistantState;
    const parsed = JSON.parse(raw) as Partial<AssistantState>;
    // Never restore into the success screen; continue where the user left off.
    const phase = parsed.phase === "success" ? "welcome" : parsed.phase;
    return { ...initialAssistantState, ...parsed, phase: phase ?? "welcome" };
  } catch {
    return initialAssistantState;
  }
}

export function saveAssistantState(state: AssistantState): void {
  try {
    // Don't persist a finished submission or an untouched welcome screen.
    if (state.phase === "success" || (state.phase === "welcome" && Object.keys(state.answers).length === 0)) {
      window.sessionStorage.removeItem(KEY);
      return;
    }
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function clearAssistantState(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
