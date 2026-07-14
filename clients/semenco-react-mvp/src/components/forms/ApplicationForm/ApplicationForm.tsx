import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useFormContext } from "react-hook-form";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/routes/paths";
import { applicationFormContent } from "@/data/applicationFormContent";
import { ApplicationFormProvider, useApplicationSteps } from "./ApplicationFormProvider";
import { ApplicationIntro } from "./ApplicationIntro";
import { ApplicationProgress } from "./ApplicationProgress";
import { ApplicationErrorSummary } from "./ApplicationErrorSummary";
import { ApplicationNavigation } from "./ApplicationNavigation";
import type { ApplicationFormValues } from "./applicationFormSchema";
import type { StepId } from "./applicationFormTypes";
import { RequestTypeStep } from "./steps/RequestTypeStep";
import { ApplicantStep } from "./steps/ApplicantStep";
import { ContactStep } from "./steps/ContactStep";
import { ChildDetailsStep } from "./steps/ChildDetailsStep";
import { SupportNeedsStep } from "./steps/SupportNeedsStep";
import { CareDetailsStep } from "./steps/CareDetailsStep";
import { PreferencesStep } from "./steps/PreferencesStep";
import { ReviewStep } from "./steps/ReviewStep";

type Phase = "intro" | "form" | "success";

const stepComponents: Record<StepId, () => JSX.Element> = {
  requestType: RequestTypeStep,
  applicant: ApplicantStep,
  contact: ContactStep,
  child: ChildDetailsStep,
  support: SupportNeedsStep,
  care: CareDetailsStep,
  preferences: PreferencesStep,
  review: ReviewStep,
};

function SuccessConfirmation({ onRestart }: { onRestart: () => void }) {
  const { confirmation } = applicationFormContent;
  return (
    <div className="rounded-2xl border border-border bg-surface p-8 shadow-soft">
      <div className="text-center">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-2xl font-semibold text-text-primary">{confirmation.title}</h2>
        <p className="mx-auto mt-3 max-w-prose text-text-secondary">{confirmation.isDemo}</p>
      </div>
      <div className="mx-auto mt-6 max-w-prose rounded-xl border border-border bg-surface-muted p-4">
        <p className="text-sm font-medium text-text-primary">Wat er normaal gesproken gebeurt:</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-text-secondary">
          {confirmation.nextSteps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button to={ROUTES.home}>Terug naar home</Button>
        <Button type="button" variant="secondary" onClick={onRestart}>
          Nieuwe aanvraag starten
        </Button>
      </div>
    </div>
  );
}

/** Inner flow: intro → steps → success. Lives inside the provider. */
function ApplicationFormFlow() {
  const { handleSubmit } = useFormContext<ApplicationFormValues>();
  const { current, currentIndex, isLast, clearDraft } = useApplicationSteps();
  const [phase, setPhase] = useState<Phase>("intro");
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move focus to the step heading whenever the step changes (in-form only).
  useEffect(() => {
    if (phase === "form") headingRef.current?.focus();
  }, [currentIndex, phase]);

  const onSubmit = async (): Promise<void> => {
    setSubmitting(true);
    // TODO: Replace demo submission with backend API integration.
    await new Promise((resolve) => setTimeout(resolve, 700));
    clearDraft(); // remove the saved draft after a successful (demo) submission
    setSubmitting(false);
    setPhase("success");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLFormElement>): void => {
    if (event.key !== "Enter" || isLast) return;
    const target = event.target as HTMLElement;
    if (target.tagName !== "TEXTAREA") event.preventDefault();
  };

  if (phase === "intro") {
    return <ApplicationIntro onStart={() => setPhase("form")} />;
  }
  if (phase === "success") {
    return (
      <SuccessConfirmation
        onRestart={() => {
          clearDraft();
          setPhase("intro");
        }}
      />
    );
  }

  const StepComponent = stepComponents[current.id];

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onKeyDown={handleKeyDown}
      noValidate
      className="rounded-2xl border border-border bg-surface p-6 shadow-soft sm:p-8"
    >
      <ApplicationProgress />

      <div className="mt-8">
        <h2 ref={headingRef} tabIndex={-1} className="text-xl font-semibold text-text-primary focus-visible:outline-none">
          {current.heading}
        </h2>
        {current.intro && <p className="mt-1 text-sm text-text-secondary">{current.intro}</p>}

        <div className="mt-5 space-y-5">
          <ApplicationErrorSummary />
          <StepComponent />
        </div>
      </div>

      <ApplicationNavigation submitting={submitting} />
    </form>
  );
}

/** Public entry point: the full multistep application form (frontend-only). */
export function ApplicationForm() {
  return (
    <ApplicationFormProvider>
      <ApplicationFormFlow />
    </ApplicationFormProvider>
  );
}
