import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  MapPin,
  Phone,
  Smartphone,
  Mail,
  Clock,
  MessageCircle,
  Facebook,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { field } from "@/components/forms/fieldStyles";
import { company } from "@/data/company";
import { features } from "@/config/features";
import { formatRanges, getOpenState } from "@/lib/openingHours";
import { isValidPhoneNL, isValidEmail } from "@/lib/validation";
import { localBusinessSchema, breadcrumbSchema } from "@/lib/structuredData";
import { cn } from "@/utils/cn";

const ONDERWERPEN = [
  { value: "algemeen", label: "Algemene vraag" },
  { value: "afspraak", label: "Afspraak / werkplaats" },
  { value: "occasion", label: "Een occasion" },
  { value: "auto-verkopen", label: "Mijn auto verkopen" },
  { value: "klacht", label: "Klacht of feedback" },
];

const mapEmbed = `https://www.google.com/maps?q=${encodeURIComponent(
  `${company.address.street} ${company.address.postalCode} ${company.address.city}`,
)}&output=embed`;

export function ContactPage() {
  const [params] = useSearchParams();
  const open = getOpenState(company.openingHours);
  const wa = features.whatsapp ? company.whatsapp : null;

  const [form, setForm] = useState({
    naam: "",
    telefoon: "",
    email: "",
    onderwerp: "algemeen",
    bericht: "",
    privacy: false,
  });
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [touched, setTouched] = useState(false);

  // Prefill vanuit occasion-detailpagina (?onderwerp=occasion&auto=…).
  useEffect(() => {
    const onderwerp = params.get("onderwerp");
    const auto = params.get("auto");
    if (onderwerp && ONDERWERPEN.some((o) => o.value === onderwerp)) {
      setForm((f) => ({
        ...f,
        onderwerp,
        bericht: auto && !f.bericht ? `Ik heb interesse in: ${auto}. ` : f.bericht,
      }));
    }
  }, [params]);

  const upd = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));
  const phoneInvalid = form.telefoon.trim() !== "" && !isValidPhoneNL(form.telefoon);
  const emailInvalid = form.email.trim() !== "" && !isValidEmail(form.email);
  const valid =
    form.naam.trim() !== "" &&
    isValidPhoneNL(form.telefoon) &&
    form.bericht.trim() !== "" &&
    form.privacy;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!valid) return;
    setStatus("sending");
    // Mock: geen backend gekoppeld. Zie docs — contactafhandeling volgt met de leadbackend.
    await new Promise((r) => setTimeout(r, 500));
    console.info("[MOCK] contactformulier", form);
    setStatus("sent");
  };

  return (
    <>
      <SEO
        title={`Contact — ${company.address.city}`}
        description={`Bel, mail of kom langs bij ${company.name} aan de ${company.address.street} in ${company.address.city}. Bekijk onze openingstijden en stuur ons een bericht.`}
        path="/contact"
        jsonLd={[
          localBusinessSchema(),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Contact", path: "/contact" },
          ]),
        ]}
      />

      <PageHero
        eyebrow="Contact"
        title="Neem contact op"
        intro="Een vraag, een afspraak of interesse in een occasion? Wij helpen u graag persoonlijk verder."
        crumbs={[{ label: "Home", to: "/" }, { label: "Contact" }]}
      />

      <Section tone="paper" size="lg">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-14">
            {/* Contactgegevens */}
            <div>
              <div className="flex items-center gap-2.5">
                <span className={cn("inline-flex h-2.5 w-2.5 rounded-full", open.open ? "bg-status-available" : "bg-status-soon")} aria-hidden />
                <span className="font-mono text-sm font-semibold text-text-strong">{open.message}</span>
              </div>

              <ul className="mt-6 space-y-4">
                <ContactRow icon={MapPin} label="Adres">
                  <a href={company.address.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-petrol">
                    {company.address.street}, {company.address.postalCode} {company.address.city}
                  </a>
                </ContactRow>
                <ContactRow icon={Phone} label="Telefoon">
                  <a href={company.phone.href} className="font-mono hover:text-petrol">{company.phone.display}</a>
                </ContactRow>
                {company.mobile && (
                  <ContactRow icon={Smartphone} label="Mobiel">
                    <a href={company.mobile.href} className="font-mono hover:text-petrol">{company.mobile.display}</a>
                  </ContactRow>
                )}
                <ContactRow icon={Mail} label="E-mail">
                  <a href={`mailto:${company.email}`} className="hover:text-petrol">{company.email}</a>
                </ContactRow>
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button href={company.phone.href}>
                  <Phone className="h-4 w-4" aria-hidden /> Bel ons
                </Button>
                {wa && (
                  <Button href={wa.href} variant="outline">
                    <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                  </Button>
                )}
                {company.social.facebook && (
                  <Button href={company.social.facebook} variant="ghost">
                    <Facebook className="h-4 w-4" aria-hidden /> Facebook
                  </Button>
                )}
              </div>

              {/* Openingstijden */}
              <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
                <h2 className="flex items-center gap-2 font-mono text-2xs uppercase tracking-label text-text-muted">
                  <Clock className="h-4 w-4" aria-hidden /> Openingstijden
                </h2>
                <ul className="mt-4 divide-y divide-line">
                  {company.openingHours.map((d) => (
                    <li key={d.weekday} className="flex justify-between gap-4 py-2 text-sm">
                      <span className="text-text-body">{d.day}</span>
                      <span className="font-mono text-text-strong">{formatRanges(d)}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Kaart */}
              <div className="mt-6 overflow-hidden rounded-2xl border border-line">
                <iframe
                  title={`Locatie ${company.name} op de kaart`}
                  src={mapEmbed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="aspect-[16/10] w-full border-0"
                />
              </div>
            </div>

            {/* Formulier */}
            <div>
              <div className="rounded-2xl border border-line bg-surface p-6 shadow-soft sm:p-8">
                {status === "sent" ? (
                  <div className="py-6 text-center">
                    <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-full bg-success/15 text-success">
                      <CheckCircle2 className="h-8 w-8" aria-hidden />
                    </span>
                    <h2 className="mt-4 font-display text-2xl font-bold text-text-strong">Bericht verzonden</h2>
                    <p className="mx-auto mt-2 max-w-sm text-text-muted">
                      Bedankt voor uw bericht. Wij nemen zo spoedig mogelijk contact met u op.
                    </p>
                    <p className="mx-auto mt-3 max-w-sm text-xs text-text-muted">
                      Liever direct contact? Bel{" "}
                      <a href={company.phone.href} className="text-petrol hover:underline">{company.phone.display}</a>.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={submit} noValidate>
                    <h2 className="font-display text-xl font-bold text-text-strong">Stuur ons een bericht</h2>
                    <p className="mt-1 text-sm text-text-muted">Velden met * zijn verplicht.</p>

                    <div className="mt-5 grid gap-4">
                      <div>
                        <label htmlFor="ct-naam" className={field.label}>Naam *</label>
                        <input id="ct-naam" value={form.naam} onChange={(e) => upd({ naam: e.target.value })} className={cn(field.input, touched && form.naam.trim() === "" && field.inputError)} autoComplete="name" />
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="ct-tel" className={field.label}>Telefoon *</label>
                          <input id="ct-tel" type="tel" value={form.telefoon} onChange={(e) => upd({ telefoon: e.target.value })} className={cn(field.input, phoneInvalid && field.inputError)} autoComplete="tel" aria-invalid={phoneInvalid} placeholder="06 …" />
                          {phoneInvalid && <p className={field.errorText}>Voer een geldig telefoonnummer in.</p>}
                        </div>
                        <div>
                          <label htmlFor="ct-mail" className={field.label}>E-mail <span className="font-normal text-text-muted">(optioneel)</span></label>
                          <input id="ct-mail" type="email" value={form.email} onChange={(e) => upd({ email: e.target.value })} className={cn(field.input, emailInvalid && field.inputError)} autoComplete="email" aria-invalid={emailInvalid} />
                          {emailInvalid && <p className={field.errorText}>Controleer uw e-mailadres.</p>}
                        </div>
                      </div>
                      <div>
                        <label htmlFor="ct-onderwerp" className={field.label}>Onderwerp</label>
                        <select id="ct-onderwerp" value={form.onderwerp} onChange={(e) => upd({ onderwerp: e.target.value })} className={field.select}>
                          {ONDERWERPEN.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="ct-bericht" className={field.label}>Bericht *</label>
                        <textarea id="ct-bericht" value={form.bericht} onChange={(e) => upd({ bericht: e.target.value })} className={cn(field.textarea, touched && form.bericht.trim() === "" && field.inputError)} placeholder="Waarmee kunnen we u helpen?" />
                      </div>

                      <label className="flex items-start gap-3">
                        <input type="checkbox" checked={form.privacy} onChange={(e) => upd({ privacy: e.target.checked })} className="mt-0.5 h-4 w-4 accent-[hsl(var(--petrol))]" />
                        <span className="text-sm text-text-body">
                          Ik ga ermee akkoord dat mijn gegevens worden gebruikt om mijn bericht te beantwoorden. *
                        </span>
                      </label>

                      {touched && !valid && (
                        <p className="flex items-center gap-1.5 text-sm text-error" role="alert">
                          <AlertCircle className="h-4 w-4" aria-hidden /> Vul de verplichte velden in (naam, telefoon, bericht en toestemming).
                        </p>
                      )}

                      <div>
                        <Button type="submit" size="lg" disabled={status === "sending"}>
                          {status === "sending" ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
                          Bericht versturen
                        </Button>
                      </div>

                      {features.demoDisclaimers && (
                        <p className="flex items-start gap-2 text-xs text-text-muted">
                          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                          Demo: het contactformulier is nog niet gekoppeld aan een mailbox. Bel of mail ons gerust rechtstreeks.
                        </p>
                      )}
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

function ContactRow({ icon: Icon, label, children }: { icon: typeof MapPin; label: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-petrol-soft text-petrol-strong">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <div>
        <p className="font-mono text-2xs uppercase tracking-label text-text-muted">{label}</p>
        <p className="mt-0.5 text-text-body">{children}</p>
      </div>
    </li>
  );
}
