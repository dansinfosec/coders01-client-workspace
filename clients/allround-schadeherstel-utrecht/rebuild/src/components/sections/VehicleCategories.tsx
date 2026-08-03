import { vehicleCategories } from "@/data/vehicles";
import { Section } from "@/components/ui/Section";
import { VehicleIcon } from "@/components/ui/VehicleIcon";

export function VehicleCategories() {
  return (
    <Section id="voertuigen" aria-labelledby="voertuigen-title">
      <div className="max-w-prose">
        <p className="eyebrow">
          <span className="accent-rule" aria-hidden />
          Voertuigen
        </p>
        <h2 id="voertuigen-title" className="mt-4 text-3xl font-bold sm:text-4xl">
          Eén partij voor verschillende voertuigen
        </h2>
        <p className="mt-4 text-text-body">
          Of het nu om uw auto, motor, scooter of boot gaat — u kunt met
          uiteenlopende schade bij ons terecht. We beoordelen de situatie en
          bespreken wat er mogelijk is.
        </p>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {vehicleCategories.map((v) => (
          <li
            key={v.key}
            className="group rounded-xl border border-line bg-surface-muted/50 p-6 transition-colors hover:border-orange/60"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange/10 text-orange transition-colors group-hover:bg-orange group-hover:text-ink">
              <VehicleIcon name={v.key} className="h-7 w-7" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-text-strong">{v.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">{v.description}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
