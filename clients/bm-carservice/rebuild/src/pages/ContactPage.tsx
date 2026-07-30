import { useState } from "react";
import { Phone, Mail, MapPin, MessageCircle, ExternalLink, Send, CheckCircle2 } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { OpeningHours } from "@/components/sections/OpeningHours";
import { LocationMap } from "@/components/sections/LocationMap";
import { CTASection } from "@/components/sections/CTASection";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { locations, defaultLocation, locationAddressLine } from "@/data/locations";
import { company } from "@/data/company";
import { fieldBase, labelBase, errorText } from "@/components/forms/fieldStyles";
import { cn } from "@/utils/cn";

export function ContactPage() {
  const [locId, setLocId] = useState(defaultLocation.id);
  const loc = locations.find((l) => l.id === locId) ?? defaultLocation;
  const tel = loc.whatsapp ? `tel:+${loc.whatsapp}` : company.phone.href;
  const wa = loc.whatsapp ? `https://wa.me/${loc.whatsapp}` : `https://wa.me/${company.phone.whatsapp}`;
  const email = loc.email ?? company.email;

  const [form, setForm] = useState({ naam: "", email: "", bericht: "" });
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = () => {
    if (form.naam.trim().length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || form.bericht.trim().length < 5) {
      setError("Vul uw naam, een geldig e-mailadres en een bericht in.");
      return;
    }
    setError(null);
    const body = [
      `Vestiging: ${loc.name} (${loc.id})`,
      `Naam: ${form.naam}`,
      `E-mail: ${form.email}`,
      "",
      form.bericht,
    ].join("\n");
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      `Contact via website — ${loc.city}`,
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

  return (
    <>
      <SEO
        title="Contact & route | BM Carservice"
        description="Neem contact op met BM Carservice. Kies uw vestiging voor het juiste adres, telefoonnummer, openingstijden en route."
        path="/contact"
      />
      <PageHero
        eyebrow="Contact"
        title="Neem contact op"
        intro="Kies uw vestiging — we tonen dan direct de juiste gegevens en route."
        crumbs={[{ label: "Home", to: "/" }, { label: "Contact" }]}
      />

      <Section tone="default">
        {/* Location selector */}
        <h2 className="text-lg">Met welke vestiging wilt u contact opnemen?</h2>
        <div role="radiogroup" aria-label="Vestiging" className="mt-4 flex flex-wrap gap-2">
          {locations.map((l) => {
            const active = l.id === locId;
            return (
              <button
                key={l.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setLocId(l.id)}
                className={cn(
                  "rounded-full border-2 px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2",
                  active ? "border-mark bg-mark text-white" : "border-line bg-surface text-text-strong hover:border-ink/40",
                )}
              >
                {l.city}
                {l.isPlaceholder && <span className="ml-1.5 font-mono text-[0.6rem] uppercase opacity-70">demo</span>}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-10 lg:grid-cols-12">
          {/* Details + form */}
          <div className="space-y-6 lg:col-span-5">
            {loc.isPlaceholder && (
              <div className="rounded-xl border border-signal bg-signal/15 px-4 py-3 text-sm text-text-strong">
                Demovestiging — gegevens nog te bevestigen. Berichten komen voorlopig binnen bij de
                hoofdvestiging Amstelveen.
              </div>
            )}
            <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft">
              <h3 className="text-lg">{loc.name}</h3>
              <ul className="mt-4 space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-mark" /> {locationAddressLine(loc)}
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="h-5 w-5 shrink-0 text-mark" />
                  <a href={tel} className="font-semibold hover:text-mark-strong">{loc.phone ?? company.phone.display}</a>
                </li>
                <li className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 shrink-0 text-mark" />
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="hover:text-mark-strong">WhatsApp</a>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="h-5 w-5 shrink-0 text-mark" />
                  <a href={`mailto:${email}`} className="hover:text-mark-strong">{email}</a>
                </li>
              </ul>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {loc.googleMapsUrl && (
                  <Button href={loc.googleMapsUrl} target="_blank" rel="noopener noreferrer" variant="outline" className="w-full">
                    <ExternalLink className="h-4 w-4" /> Route
                  </Button>
                )}
                <Button to={`/afspraak-maken?vestiging=${loc.slug}`} variant="mark" className="w-full">Afspraak maken</Button>
              </div>
            </div>

            <OpeningHours hours={loc.openingHours} />
          </div>

          {/* Map + form */}
          <div className="space-y-6 lg:col-span-7">
            <LocationMap location={loc} className="h-[22rem] overflow-hidden rounded-2xl border border-line" />

            {sent ? (
              <div className="rounded-2xl border border-line bg-surface p-6 text-center shadow-soft">
                <CheckCircle2 className="mx-auto h-10 w-10 text-pass" />
                <p className="mt-3 text-text-body">Uw e-mailprogramma is geopend. Verzend de mail om uw bericht te versturen.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => { e.preventDefault(); submit(); }}
                noValidate
                className="rounded-2xl border border-line bg-surface p-6 shadow-soft"
              >
                <h3 className="text-lg">Stuur een bericht</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-naam" className={labelBase}>Naam</label>
                    <input id="c-naam" className={fieldBase} value={form.naam} onChange={(e) => setForm({ ...form, naam: e.target.value })} autoComplete="name" />
                  </div>
                  <div>
                    <label htmlFor="c-email" className={labelBase}>E-mail</label>
                    <input id="c-email" className={fieldBase} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" inputMode="email" />
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="c-bericht" className={labelBase}>Bericht</label>
                  <textarea id="c-bericht" rows={4} className={fieldBase} value={form.bericht} onChange={(e) => setForm({ ...form, bericht: e.target.value })} />
                </div>
                {error && <p className={errorText}>{error}</p>}
                <div className="mt-4">
                  <Button type="submit" variant="mark"><Send className="h-4 w-4" /> Versturen</Button>
                  <p className="mt-2 text-xs text-text-muted">Uw bericht gaat naar de vestiging {loc.city}.</p>
                </div>
              </form>
            )}
          </div>
        </div>
      </Section>
      <CTASection />
    </>
  );
}
