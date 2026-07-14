import { processSteps } from "@/data/process";

/** The 5-step work process as a numbered, icon-led sequence. */
export function ProcessTimeline() {
  return (
    <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {processSteps.map((step) => {
        const Icon = step.icon;
        return (
          <li key={step.id} className="relative rounded-2xl border border-line bg-surface p-5 shadow-soft">
            <div className="flex items-center justify-between">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-navy text-green">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              <span aria-hidden="true" className="text-2xl font-bold text-line">{step.order}</span>
            </div>
            <h3 className="mt-3 text-base font-bold text-text-strong">
              <span className="sr-only">Stap {step.order}: </span>
              {step.title}
            </h3>
            <p className="mt-1 text-sm text-text-muted">{step.description}</p>
          </li>
        );
      })}
    </ol>
  );
}
