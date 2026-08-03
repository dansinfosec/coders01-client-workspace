import { Section } from "@/components/ui/Section";

export function About() {
  return (
    <Section id="over" aria-labelledby="over-title" className="bg-surface-muted/30">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div>
          <p className="eyebrow">
            <span className="accent-rule" aria-hidden />
            Over ons
          </p>
          <h2 id="over-title" className="mt-4 text-3xl font-bold sm:text-4xl">
            Allround vakwerk, persoonlijk geregeld
          </h2>
          <div className="mt-4 space-y-4 text-text-body">
            <p>
              Allround Schadeherstel Utrecht is er voor uiteenlopende
              schadegevallen aan auto, motor, scooter en boot. Eén partij die
              meedenkt, de schade beoordeelt en zorgt voor een passende
              hersteloplossing.
            </p>
            <p>
              We combineren aandacht voor degelijk herstel en een nette afwerking
              met direct en persoonlijk contact. Zowel particulieren als bedrijven
              kunnen bij ons terecht — laagdrempelig en zonder omwegen.
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-line">
          <img
            src="/images/ai-preview/vakmanschap-detail.webp"
            alt="Sfeerimpressie: close-up van nauwkeurige voorbereiding en lakafwerking op een voertuigpaneel"
            width={1200}
            height={805}
            loading="lazy"
            decoding="async"
            className="aspect-[3/2] w-full object-cover"
          />
          <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur">
            Sfeerimpressie
          </span>
        </div>
      </div>
    </Section>
  );
}
