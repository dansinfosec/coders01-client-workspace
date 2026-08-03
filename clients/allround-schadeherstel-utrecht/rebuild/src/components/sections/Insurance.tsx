import { ClipboardList, FileSearch, MessagesSquare } from "lucide-react";
import { Section } from "@/components/ui/Section";

const steps = [
  {
    icon: ClipboardList,
    title: "Geef aan dat het om verzekeringsschade gaat",
    text: "Laat bij uw aanvraag weten dat het een verzekeringskwestie betreft, dan houden we daar rekening mee.",
  },
  {
    icon: FileSearch,
    title: "We bekijken de schade en documenten",
    text: "We beoordelen de schade en nemen samen met u de beschikbare gegevens door.",
  },
  {
    icon: MessagesSquare,
    title: "Vervolgstappen bespreken we persoonlijk",
    text: "Wat er daarna nodig is, bespreken we in duidelijk en persoonlijk overleg.",
  },
];

export function Insurance() {
  return (
    <Section id="verzekering" aria-labelledby="verzekering-title" className="bg-surface-muted/30">
      <div className="max-w-prose">
        <p className="eyebrow">
          <span className="accent-rule" aria-hidden />
          Verzekeringsschade
        </p>
        <h2 id="verzekering-title" className="mt-4 text-3xl font-bold sm:text-4xl">
          Schade via de verzekering? Bespreekbaar.
        </h2>
        <p className="mt-4 text-text-body">
          Gaat het om schade die via een verzekering loopt? Geef dit aan bij uw
          aanvraag. We bekijken de schade en bespreken samen met u de mogelijke
          vervolgstappen.
        </p>
      </div>

      <ol className="mt-10 grid gap-4 sm:grid-cols-3">
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-xl border border-line bg-surface p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange/10 text-orange">
                <s.icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-sm font-semibold text-orange">Stap {i + 1}</span>
            </div>
            <h3 className="mt-4 text-base font-semibold text-text-strong">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">{s.text}</p>
          </li>
        ))}
      </ol>

      <p className="mt-6 max-w-prose text-xs text-text-muted">
        Hoe de afhandeling met uw verzekeraar precies verloopt, bespreken we per
        situatie. Aan de informatie op deze pagina kunnen geen rechten worden
        ontleend.
      </p>
    </Section>
  );
}
