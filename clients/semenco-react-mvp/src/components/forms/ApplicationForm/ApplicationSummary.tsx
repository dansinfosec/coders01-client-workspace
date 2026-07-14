import { useFormContext } from "react-hook-form";
import { Pencil } from "lucide-react";
import type { ApplicationFormValues } from "./applicationFormSchema";
import { useApplicationSteps } from "./ApplicationFormProvider";
import {
  applicantTypeOptions,
  contactMethodOptions,
  fundingOptions,
  requestTypeOptions,
  supportAreaOptions,
  urgencyOptions,
  wantIntroOptions,
  yesNoUnknownOptions,
} from "./applicationFormConfig";
import type { Option } from "./applicationFormTypes";

const dash = "—";

function label(value: string, options: Option[]): string {
  if (!value) return dash;
  return options.find((o) => o.value === value)?.label ?? value;
}

function requestLabel(value: string): string {
  return requestTypeOptions.find((o) => o.id === value)?.label ?? (value || dash);
}
function applicantLabel(value: string): string {
  return applicantTypeOptions.find((o) => o.id === value)?.label ?? (value || dash);
}
function multiLabel(values: string[], options: Option[]): string {
  if (!values || values.length === 0) return dash;
  return values.map((v) => options.find((o) => o.value === v)?.label ?? v).join(", ");
}
const text = (v: string): string => (v.trim() ? v : dash);

interface Row {
  label: string;
  value: string;
}
interface Group {
  title: string;
  stepIndex: number;
  rows: Row[];
}

/** Read-only review of all answers, grouped by step, each with an edit link. */
export function ApplicationSummary() {
  const { watch } = useFormContext<ApplicationFormValues>();
  const { goToStep } = useApplicationSteps();
  const v = watch();

  const applicantRows: Row[] = [{ label: "Rol", value: applicantLabel(v.applicantType) }];
  if (v.applicantType === "parent") {
    applicantRows.push({ label: "Relatie", value: text(v.applicantRelation) });
  }
  if (v.applicantType === "professional") {
    applicantRows.push({ label: "Organisatie", value: text(v.organisation) });
    applicantRows.push({ label: "Functie", value: text(v.role) });
  }

  const prefRows: Row[] = [
    { label: "Startperiode", value: text(v.preferredStart) },
    { label: "Dagen/periodes", value: text(v.relevantPeriods) },
    { label: "Kennismaking", value: label(v.wantIntroTalk, wantIntroOptions) },
  ];
  if (v.requestType === "crisis") {
    prefRows.push({ label: "Situatie", value: text(v.crisisSituation) });
  }
  prefRows.push({ label: "Opmerkingen", value: text(v.comments) });

  const groups: Group[] = [
    { title: "Aanvraag", stepIndex: 0, rows: [{ label: "Type", value: requestLabel(v.requestType) }] },
    { title: "Aanvrager", stepIndex: 1, rows: applicantRows },
    {
      title: "Contact",
      stepIndex: 2,
      rows: [
        { label: "Naam", value: text(v.fullName) },
        { label: "E-mail", value: text(v.email) },
        { label: "Telefoon", value: text(v.phone) },
        { label: "Voorkeur", value: label(v.contactMethod, contactMethodOptions) },
        { label: "Moment", value: text(v.contactTime) },
      ],
    },
    {
      title: "Kind of jongere",
      stepIndex: 3,
      rows: [
        { label: "Voornaam", value: text(v.childFirstName) },
        { label: "Leeftijd", value: text(v.childAge) },
        { label: "Gemeente", value: text(v.childMunicipality) },
        { label: "School/dagbesteding", value: text(v.childDaytime) },
      ],
    },
    {
      title: "Ondersteuning",
      stepIndex: 4,
      rows: [
        { label: "Onderwerpen", value: multiLabel(v.supportAreas, supportAreaOptions) },
        { label: "Belangrijk", value: text(v.supportImportant) },
      ],
    },
    {
      title: "Zorg en verwijzing",
      stepIndex: 5,
      rows: [
        { label: "Ondersteuning nu", value: label(v.currentSupport, yesNoUnknownOptions) },
        { label: "Verwijzer", value: label(v.hasReferrer, yesNoUnknownOptions) },
        { label: "Financiering", value: label(v.funding, fundingOptions) },
        { label: "Urgentie", value: label(v.requestUrgency, urgencyOptions) },
      ],
    },
    { title: "Voorkeuren", stepIndex: 6, rows: prefRows },
  ];

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.title} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-text-primary">{group.title}</h3>
            <button
              type="button"
              onClick={() => goToStep(group.stepIndex)}
              className="inline-flex items-center gap-1 rounded text-sm font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
            >
              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
              Wijzig
            </button>
          </div>
          <dl className="mt-2 grid gap-x-4 gap-y-1 sm:grid-cols-[11rem_1fr]">
            {group.rows.map((row) => (
              <div key={row.label} className="contents">
                <dt className="text-sm text-text-secondary">{row.label}</dt>
                <dd className="text-sm text-text-primary">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
    </div>
  );
}
