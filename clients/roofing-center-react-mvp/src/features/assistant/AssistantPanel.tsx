import { useEffect, useRef, useState } from "react";
import { X, HardHat, CheckCircle2, Phone, MessageCircle } from "lucide-react";
import { useAssistant } from "./AssistantContext";
import { AssistantMessage } from "./AssistantMessage";
import { AssistantOptions } from "./AssistantOptions";
import { AssistantFormStep } from "./AssistantFormStep";
import { AssistantSummary } from "./AssistantSummary";
import { assistantConfig } from "./assistantConfig";
import { flowSteps, choiceLabel, issueLabels } from "./assistantFlow";
import { initialAssistantState, loadAssistantState, saveAssistantState, clearAssistantState } from "./assistantStorage";
import type { AssistantState, UploadMeta } from "./assistantTypes";
import { useLockBodyScroll } from "@/hooks/useLockBodyScroll";
import { Button } from "@/components/ui/Button";
import { leadAdapter } from "@/lib/leadAdapter";
import { company, contact, whatsappLink, telLink } from "@/data/company";

/** The Dakassistent dialog: guided lead flow with transcript, summary & success. */
export function AssistantPanel() {
  const { open, closeAssistant } = useAssistant();
  const [state, setState] = useState<AssistantState>(() => loadAssistantState());
  const [submitting, setSubmitting] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const titleId = "dakassistent-title";

  useLockBodyScroll(open);
  useEffect(() => saveAssistantState(state), [state]);

  // Focus the panel on open; Escape closes; simple focus trap.
  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") { e.preventDefault(); closeAssistant(); }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, closeAssistant]);

  // Auto-scroll to the newest message.
  useEffect(() => {
    if (open) scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [open, state.stepIndex, state.phase]);

  if (!open) return null;

  const step = flowSteps[state.stepIndex];

  const selectIssue = (value: string) =>
    setState((s) => ({ ...s, answers: { ...s.answers, issue: value }, phase: "flow", stepIndex: 0 }));

  const answerStep = (value: string) =>
    setState((s) => {
      const cur = flowSteps[s.stepIndex];
      if (!cur) return s;
      const answers = { ...s.answers, [cur.id]: value };
      const consent = cur.id === "consent" ? value === "true" : s.consent;
      if (s.editingReturnToSummary) return { ...s, answers, consent, phase: "summary", editingReturnToSummary: false };
      const next = s.stepIndex + 1;
      return next >= flowSteps.length
        ? { ...s, answers, consent, phase: "summary" }
        : { ...s, answers, consent, stepIndex: next };
    });

  const setFiles = (metas: UploadMeta[]) => setState((s) => ({ ...s, uploads: metas }));
  const editStep = (index: number) => setState((s) => ({ ...s, phase: "flow", stepIndex: index, editingReturnToSummary: true }));
  const restart = () => { clearAssistantState(); setState({ ...initialAssistantState }); };

  const submit = async () => {
    setSubmitting(true);
    const fields: Record<string, string> = { Onderwerp: issueLabels[state.answers.issue ?? ""] ?? "" };
    for (const s of flowSteps) {
      const v = state.answers[s.id] ?? "";
      fields[s.summaryLabel] = s.kind === "options" && v ? choiceLabel(s, v) : v;
    }
    const res = await leadAdapter.submit({
      source: "assistant",
      fields,
      attachments: state.uploads,
      submittedAt: new Date().toISOString(),
      consent: state.consent,
    });
    setSubmitting(false);
    if (res.ok) {
      clearAssistantState();
      setState((s) => ({ ...s, phase: "success", reference: res.reference }));
    }
  };

  const leakActive = state.answers.leak === "ja";

  return (
    <div className="fixed inset-0 z-[60] sm:inset-auto sm:bottom-24 sm:right-5">
      {/* Backdrop (mobile only) */}
      <div className="fixed inset-0 bg-navy-900/50 sm:hidden" aria-hidden="true" onClick={closeAssistant} />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="absolute inset-x-0 bottom-0 flex h-[85dvh] flex-col overflow-hidden rounded-t-2xl bg-surface shadow-lift focus:outline-none sm:static sm:h-[min(70dvh,620px)] sm:w-[380px] sm:rounded-2xl sm:border sm:border-line animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-line-invert bg-navy px-4 py-3 text-text-invert">
          <div className="flex items-center gap-2.5">
            <span aria-hidden="true" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-navy-800 text-green">
              <HardHat className="h-4 w-4" />
            </span>
            <div>
              <p id={titleId} className="text-sm font-semibold leading-tight">{assistantConfig.name}</p>
              <p className="text-[11px] text-text-invert/70">Demo · geen live AI-koppeling</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAssistant}
            aria-label="Assistent sluiten"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-invert hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Conversation */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          <AssistantMessage from="assistant">{assistantConfig.welcome}</AssistantMessage>
          <AssistantMessage from="assistant">{assistantConfig.intro}</AssistantMessage>

          {state.phase === "welcome" ? (
            <AssistantOptions choices={assistantConfig.welcomeOptions as unknown as { value: string; label: string }[]} onSelect={selectIssue} ariaLabel="Kies een onderwerp" />
          ) : (
            <>
              <AssistantMessage from="user">{issueLabels[state.answers.issue ?? ""] ?? state.answers.issue}</AssistantMessage>

              {/* Answered steps */}
              {flowSteps.map((s, i) => {
                if (i >= state.stepIndex && state.phase === "flow") return null;
                if (state.phase === "flow" && i >= state.stepIndex) return null;
                const answered = state.answers[s.id];
                const shown = i < state.stepIndex || state.phase === "summary" || state.phase === "success";
                if (!shown) return null;
                const display =
                  s.id === "photos" ? (state.uploads.length ? `${state.uploads.length} foto('s)` : "Geen foto's")
                  : s.id === "consent" ? (state.consent ? "Ja" : "Nee")
                  : s.kind === "options" && answered ? choiceLabel(s, answered)
                  : answered || "—";
                return (
                  <div key={s.id} className="space-y-2">
                    <AssistantMessage from="assistant">{s.prompt}</AssistantMessage>
                    <AssistantMessage from="user">{display}</AssistantMessage>
                    {s.id === "leak" && answered === "ja" && (
                      <AssistantMessage from="note">{assistantConfig.leakNote}</AssistantMessage>
                    )}
                  </div>
                );
              })}

              {/* Active flow step */}
              {state.phase === "flow" && step && (
                <div className="space-y-2 pt-1">
                  <AssistantMessage from="assistant">{step.prompt}</AssistantMessage>
                  {step.kind === "options" && step.choices ? (
                    <AssistantOptions choices={step.choices} onSelect={answerStep} ariaLabel={step.summaryLabel} />
                  ) : (
                    <AssistantFormStep
                      key={step.id}
                      step={step}
                      initialValue={state.answers[step.id] ?? ""}
                      uploads={state.uploads}
                      onFiles={setFiles}
                      onSubmit={answerStep}
                    />
                  )}
                </div>
              )}

              {/* Leak CTA (call / WhatsApp) whenever leak is active */}
              {leakActive && (contact.hasPhone || contact.hasWhatsapp) && state.phase !== "success" && (
                <div className="flex flex-wrap gap-2 rounded-xl border border-cream/70 bg-cream-soft p-3">
                  {contact.hasPhone && (
                    <Button href={telLink()} size="sm" className="flex-1">
                      <Phone className="h-4 w-4" aria-hidden="true" />{company.cta.call}
                    </Button>
                  )}
                  {contact.hasWhatsapp && (
                    <Button href={whatsappLink("Ik heb een actieve daklekkage.")} target="_blank" rel="noopener noreferrer" size="sm" variant="outlineNavy" className="flex-1">
                      <MessageCircle className="h-4 w-4" aria-hidden="true" />WhatsApp
                    </Button>
                  )}
                </div>
              )}

              {/* Summary */}
              {state.phase === "summary" && (
                <AssistantSummary
                  issue={state.answers.issue ?? ""}
                  answers={state.answers}
                  uploads={state.uploads}
                  submitting={submitting}
                  onEdit={editStep}
                  onConfirm={submit}
                />
              )}

              {/* Success */}
              {state.phase === "success" && (
                <div className="rounded-2xl border border-line bg-surface p-4 text-center">
                  <span className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-soft text-green-strong">
                    <CheckCircle2 className="h-7 w-7" aria-hidden="true" />
                  </span>
                  <h3 className="mt-3 text-base font-bold text-text-strong">{assistantConfig.successTitle}</h3>
                  <p className="mt-2 text-sm text-text-muted">{assistantConfig.successBody}</p>
                  {state.reference && <p className="mt-2 text-xs text-text-muted">Referentie: <span className="font-mono">{state.reference}</span></p>}
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <Button type="button" size="sm" onClick={restart}>Nieuwe aanvraag</Button>
                    <Button type="button" size="sm" variant="outlineNavy" onClick={closeAssistant}>Sluiten</Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
