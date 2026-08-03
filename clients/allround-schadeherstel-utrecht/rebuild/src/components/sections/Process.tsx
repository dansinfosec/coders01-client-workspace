import { Section } from "@/components/ui/Section";

const steps = [
  {
    title: "Neem contact op of stuur schadefoto's",
    text: "Bel of vul het schadeformulier in. Foto's van de schade helpen ons om snel een eerste beeld te vormen.",
  },
  {
    title: "We bekijken de schade en bespreken de mogelijkheden",
    text: "We beoordelen de situatie en leggen helder uit welke herstelmogelijkheden er zijn.",
  },
  {
    title: "U ontvangt duidelijkheid over de vervolgstappen",
    text: "U weet waar u aan toe bent en wat de opties zijn, zonder verrassingen.",
  },
  {
    title: "Na akkoord plannen we het herstel in",
    text: "Zodra u akkoord bent, maken we een afspraak en plannen we het herstel.",
  },
  {
    title: "Oplevering na controle",
    text: "We controleren het werk en leveren uw voertuig verzorgd op.",
  },
];

export function Process() {
  return (
    <Section id="werkwijze" aria-labelledby="werkwijze-title">
      <div className="max-w-prose">
        <p className="eyebrow">
          <span className="accent-rule" aria-hidden />
          Werkwijze
        </p>
        <h2 id="werkwijze-title" className="mt-4 text-3xl font-bold sm:text-4xl">
          Van eerste contact tot verzorgde oplevering
        </h2>
        <p className="mt-4 text-text-body">
          Een duidelijk en persoonlijk traject. Zo weet u steeds waar u aan toe is.
        </p>
      </div>

      <ol className="mt-10 space-y-4">
        {steps.map((s, i) => (
          <li
            key={s.title}
            className="flex gap-5 rounded-xl border border-line bg-surface-muted/40 p-5 sm:p-6"
          >
            <span
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-orange/40 bg-orange/10 text-lg font-bold text-orange"
              aria-hidden
            >
              {i + 1}
            </span>
            <div>
              <h3 className="text-base font-semibold text-text-strong sm:text-lg">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-text-muted">{s.text}</p>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  );
}
