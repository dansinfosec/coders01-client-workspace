import { services } from "@/data/services";
import { Section } from "@/components/ui/Section";

export function Services() {
  return (
    <Section id="diensten" aria-labelledby="diensten-title" className="bg-surface-muted/30">
      <div className="max-w-prose">
        <p className="eyebrow">
          <span className="accent-rule" aria-hidden />
          Diensten
        </p>
        <h2 id="diensten-title" className="mt-4 text-3xl font-bold sm:text-4xl">
          Van schadebeoordeling tot nette afwerking
        </h2>
        <p className="mt-4 text-text-body">
          We werken gericht op degelijk herstel en een verzorgde afwerking. Weet u
          niet zeker of iets mogelijk is? Vraag gerust naar de mogelijkheden.
        </p>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <li
            key={s.title}
            className="rounded-xl border border-line bg-surface p-6 transition-colors hover:border-orange/60"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange/10 text-orange">
              <s.icon className="h-6 w-6" aria-hidden />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-text-strong">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">{s.description}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
