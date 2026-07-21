import { Users, Award, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { company } from "@/data/company";
import { ROUTES } from "@/routes/paths";

/**
 * "Over ons" — built from the homepage company block on the current site.
 * Team size, experience, VCA and guarantee are stated there. The guarantee text
 * is phrased carefully because the site itself is inconsistent on the number.
 */
export function AboutSection() {
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2">
      <div>
        <p className="eyebrow">Over All-in Daktechniek</p>
        <h2 className="mt-2 text-3xl sm:text-4xl">Ervaren specialisten in dakbedekking</h2>
        <div className="mt-5 space-y-4 text-text-body">
          <p>
            Wij zijn ervaren specialisten op het gebied van verschillende soorten
            dakbedekking. Ons team bestaat uit zes dakdekkers met gemiddeld twintig jaar
            ervaring. Samen met onze klant realiseren wij een kwalitatief én duurzaam
            resultaat, zodat we een dak achterlaten waar u jaren op kunt vertrouwen.
          </p>
          <p>
            Wij staan achter ons werk en geven daarom garantie op onze werkzaamheden.
            Daarnaast zijn wij in het bezit van het VCA-certificaat, zodat veilig en
            volgens de regels wordt gewerkt.
          </p>
        </div>

        <ul className="mt-6 space-y-3">
          {[
            { icon: Users, text: company.trust.teamSize.value },
            { icon: Award, text: company.trust.experience.value },
            { icon: ShieldCheck, text: company.trust.vca.value },
          ].map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm font-semibold text-text-strong">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-soft text-green-strong">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
              {text}
            </li>
          ))}
        </ul>

        <div className="mt-8">
          <Button to={ROUTES.overOns} variant="outline">
            Meer over ons
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line shadow-card">
        <img
          src="/images/all-in-daktechniek/project-plat-dak-171237.webp"
          alt="Dakdekkers van All-in Daktechniek aan het werk op een plat dak"
          className="h-full w-full object-cover"
          loading="lazy"
          width={1200}
          height={911}
        />
      </div>
    </div>
  );
}
