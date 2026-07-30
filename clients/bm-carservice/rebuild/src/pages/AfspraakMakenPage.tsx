import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { CheckCircle2, Phone, ArrowRight, ArrowLeft, Info } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ProgressSteps } from "@/components/afspraak/ProgressSteps";
import { LocationStep } from "@/components/afspraak/LocationStep";
import { LocationBanner } from "@/components/afspraak/LocationBanner";
import { Step1Gegevens } from "@/components/afspraak/Step1Gegevens";
import { Step2Planning } from "@/components/afspraak/Step2Planning";
import { Step3Contact } from "@/components/afspraak/Step3Contact";
import { AfspraakProvider } from "@/components/afspraak/AfspraakContext";
import { useAfspraak } from "@/components/afspraak/afspraakStore";
import { getLocation } from "@/data/locations";
import { company } from "@/data/company";

const STEPS = ["Vestiging", "Voertuiggegevens", "Werkzaamheden & planning", "Contactgegevens"];

function Confirmation() {
  const { reset } = useAfspraak();
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-line bg-surface p-8 text-center shadow-soft">
      <CheckCircle2 className="mx-auto h-14 w-14 text-pass" />
      <h2 className="mt-4 text-2xl">Bedankt voor uw aanvraag</h2>
      <p className="mx-auto mt-3 max-w-md text-text-body">
        {company.appointmentEndpoint
          ? "We hebben uw afspraakaanvraag ontvangen en bevestigen zo snel mogelijk uw gekozen moment."
          : "Uw e-mailprogramma is geopend met de aanvraag. Verzend de mail om af te ronden, of bel ons direct — dan bevestigen we uw afspraak meteen."}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button href={company.phone.href} variant="mark">
          <Phone className="h-4 w-4" /> Bel {company.phone.display}
        </Button>
        <Button to="/" variant="outline" onClick={reset}>Terug naar home</Button>
      </div>
    </div>
  );
}

function AfspraakFlow() {
  const { data, update } = useAfspraak();
  const [searchParams] = useSearchParams();
  const [step, setStep] = useState(0);
  const [attempted, setAttempted] = useState<Record<number, boolean>>({});
  const [locationChanged, setLocationChanged] = useState(false);

  // Deep link: /afspraak-maken?vestiging=slug pre-selects the branch and skips step 0.
  useEffect(() => {
    const slug = searchParams.get("vestiging");
    if (!slug) return;
    const loc = getLocation(slug);
    if (!loc) return;
    if (loc.id !== data.locationId) applyLocation(loc.id);
    setStep(1);
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  /** Select/change branch: keep vehicle, keep only jobs this branch offers, clear date & time. */
  function applyLocation(id: string) {
    const previous = data.locationId;
    if (id === previous) return;
    const loc = getLocation(id);
    const allowed = loc?.services ?? [];
    update({
      locationId: id,
      ...(previous
        ? { werkzaamheden: data.werkzaamheden.filter((w) => allowed.includes(w)), datum: "", tijd: "" }
        : {}),
    });
    if (previous) setLocationChanged(true);
  }

  const step0Valid = Boolean(data.locationId);
  const step1Valid = Boolean(data.vehicle) && Boolean(data.kilometerstand);
  const step2Valid = data.werkzaamheden.length > 0 && Boolean(data.datum) && Boolean(data.tijd);

  const goNext = (from: number, valid: boolean) => {
    if (!valid) {
      setAttempted((a) => ({ ...a, [from]: true }));
      return;
    }
    setStep(from + 1);
  };

  const changeLocation = () => setStep(0);

  return (
    <Section tone="default">
      <div className="mx-auto max-w-4xl">
        <ProgressSteps steps={STEPS} current={step} />
      </div>

      <div className="mx-auto mt-10 max-w-5xl">
        {step > 0 && step < 4 && <LocationBanner locationId={data.locationId} onChange={changeLocation} />}

        {step === 0 && (
          <>
            <LocationStep selected={data.locationId} onSelect={applyLocation} />
            <div className="mt-10 flex items-center justify-end gap-4 border-t border-line pt-6">
              <Button type="button" variant="mark" size="lg" onClick={() => goNext(0, step0Valid)}>
                Volgende <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            {attempted[0] && !step0Valid && (
              <p className="mt-3 text-right text-sm text-error">Kies eerst een vestiging.</p>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <Step1Gegevens showErrors={Boolean(attempted[1])} />
            <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
              <Button type="button" variant="outline" onClick={() => setStep(0)}>
                <ArrowLeft className="h-4 w-4" /> Vorige
              </Button>
              <Button type="button" variant="mark" size="lg" onClick={() => goNext(1, step1Valid)}>
                Volgende <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {locationChanged && !data.tijd && (
              <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-signal bg-signal/15 px-4 py-3 text-sm text-text-strong">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-mark" />
                U heeft een andere vestiging gekozen. Kies opnieuw een datum en tijd voor deze vestiging.
              </div>
            )}
            <Step2Planning showErrors={Boolean(attempted[2])} />
            <div className="mt-10 flex items-center justify-between gap-4 border-t border-line pt-6">
              <Button type="button" variant="outline" onClick={() => setStep(1)}>
                <ArrowLeft className="h-4 w-4" /> Vorige
              </Button>
              <Button type="button" variant="mark" size="lg" onClick={() => goNext(2, step2Valid)}>
                Volgende stap <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}

        {step === 3 && <Step3Contact onBack={() => setStep(2)} onDone={() => setStep(4)} />}

        {step === 4 && <Confirmation />}
      </div>
    </Section>
  );
}

export function AfspraakMakenPage() {
  return (
    <>
      <SEO
        title="Afspraak maken — APK, onderhoud & reparatie | BM Carservice"
        description="Maak online een afspraak bij BM Carservice. Kies uw vestiging, vul uw kenteken in voor voertuigherkenning via de RDW en plan een beschikbare datum en tijd."
        path="/afspraak-maken"
      />
      <PageHero
        eyebrow="Afspraak"
        title="Afspraak maken"
        intro="Kies uw vestiging, vul uw kenteken in voor automatische voertuigherkenning en plan direct een moment. Voor een APK kunt u ook zonder afspraak binnenlopen."
        tone="concrete"
        crumbs={[{ label: "Home", to: "/" }, { label: "Afspraak maken" }]}
      />
      <AfspraakProvider>
        <AfspraakFlow />
      </AfspraakProvider>
    </>
  );
}
