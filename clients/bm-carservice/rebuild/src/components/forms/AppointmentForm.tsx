import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2, Send } from "lucide-react";
import { company } from "@/data/company";
import { services } from "@/data/services";
import { Button } from "@/components/ui/Button";
import { fieldBase, labelBase, errorText } from "./fieldStyles";

const schema = z.object({
  naam: z.string().min(2, "Vul uw naam in"),
  telefoon: z
    .string()
    .min(8, "Vul een geldig telefoonnummer in")
    .regex(/^[0-9+()\-\s]+$/, "Vul een geldig telefoonnummer in"),
  email: z.string().email("Vul een geldig e-mailadres in").or(z.literal("")).optional(),
  kenteken: z.string().optional(),
  merkModel: z.string().optional(),
  werkzaamheden: z.string().min(1, "Kies een dienst"),
  vervangendVervoer: z.enum(["ja", "nee"]),
  datum: z.string().optional(),
  bericht: z.string().max(1000).optional(),
  privacy: z.literal(true, { errorMap: () => ({ message: "Ga akkoord om te versturen" }) }),
});

type FormValues = z.infer<typeof schema>;

function buildMailto(v: FormValues): string {
  const lines = [
    `Naam: ${v.naam}`,
    `Telefoon: ${v.telefoon}`,
    v.email ? `E-mail: ${v.email}` : "",
    v.kenteken ? `Kenteken: ${v.kenteken}` : "",
    v.merkModel ? `Merk/model: ${v.merkModel}` : "",
    `Werkzaamheden: ${v.werkzaamheden}`,
    `Vervangend vervoer: ${v.vervangendVervoer}`,
    v.datum ? `Voorkeursdatum: ${v.datum}` : "",
    v.bericht ? `\nBericht:\n${v.bericht}` : "",
  ].filter(Boolean);
  const body = encodeURIComponent(lines.join("\n"));
  const subject = encodeURIComponent(`Afspraakaanvraag — ${v.naam}`);
  return `mailto:${company.email}?subject=${subject}&body=${body}`;
}

/**
 * Appointment request form (react-hook-form + zod). Frontend-only for now:
 * with no VITE_APPOINTMENT_ENDPOINT it opens the visitor's mail client to info@bmcarservice.nl.
 * TODO: wire a real endpoint (serverless function / form service) with the client.
 */
export function AppointmentForm() {
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { werkzaamheden: "APK keuring", vervangendVervoer: "nee" },
  });

  const onSubmit = async (values: FormValues) => {
    const endpoint = company.appointmentEndpoint;
    if (endpoint) {
      try {
        await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      } catch {
        // fall through to mailto below
      }
    }
    if (!endpoint) {
      window.location.href = buildMailto(values);
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-12 w-12 text-pass" />
        <h3 className="mt-4 text-xl">Bedankt voor uw aanvraag</h3>
        <p className="mx-auto mt-2 max-w-md text-text-body">
          {company.appointmentEndpoint
            ? "We hebben uw aanvraag ontvangen en nemen zo snel mogelijk contact met u op."
            : "Uw e-mailprogramma is geopend met de aanvraag. Verzend de mail om af te ronden, of bel ons direct."}
        </p>
        <div className="mt-6">
          <Button href={company.phone.href} variant="mark">Of bel {company.phone.display}</Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="naam" className={labelBase}>Naam *</label>
          <input id="naam" className={fieldBase} {...register("naam")} autoComplete="name" />
          {errors.naam && <p className={errorText}>{errors.naam.message}</p>}
        </div>
        <div>
          <label htmlFor="telefoon" className={labelBase}>Telefoon *</label>
          <input id="telefoon" className={fieldBase} {...register("telefoon")} autoComplete="tel" inputMode="tel" />
          {errors.telefoon && <p className={errorText}>{errors.telefoon.message}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelBase}>E-mail</label>
          <input id="email" className={fieldBase} {...register("email")} autoComplete="email" inputMode="email" />
          {errors.email && <p className={errorText}>{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="datum" className={labelBase}>Voorkeursdatum</label>
          <input id="datum" type="date" className={fieldBase} {...register("datum")} />
        </div>
      </div>

      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="sr-only">Voertuiggegevens</legend>
        <div>
          <label htmlFor="kenteken" className={labelBase}>Kenteken</label>
          <input id="kenteken" className={fieldBase} placeholder="XX-123-X" {...register("kenteken")} />
        </div>
        <div>
          <label htmlFor="merkModel" className={labelBase}>Merk &amp; model</label>
          <input id="merkModel" className={fieldBase} placeholder="Bijv. Volkswagen Golf" {...register("merkModel")} />
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="werkzaamheden" className={labelBase}>Gewenste werkzaamheden *</label>
          <select id="werkzaamheden" className={fieldBase} {...register("werkzaamheden")}>
            <option>APK keuring</option>
            {services
              .filter((s) => s.slug !== "apk")
              .map((s) => (
                <option key={s.slug}>{s.title}</option>
              ))}
            <option>Anders / weet ik niet</option>
          </select>
          {errors.werkzaamheden && <p className={errorText}>{errors.werkzaamheden.message}</p>}
        </div>
        <div>
          <label htmlFor="vervangendVervoer" className={labelBase}>Vervangend vervoer?</label>
          <select id="vervangendVervoer" className={fieldBase} {...register("vervangendVervoer")}>
            <option value="nee">Nee, niet nodig</option>
            <option value="ja">Ja, graag een leenauto</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="bericht" className={labelBase}>Toelichting</label>
        <textarea id="bericht" rows={4} className={fieldBase} {...register("bericht")} placeholder="Beschrijf uw klacht of vraag" />
      </div>

      <label className="flex items-start gap-3 text-sm text-text-body">
        <input type="checkbox" className="mt-1 h-4 w-4" {...register("privacy")} />
        <span>
          Ik ga akkoord dat mijn gegevens gebruikt worden om contact op te nemen over deze aanvraag.
        </span>
      </label>
      {errors.privacy && <p className={errorText}>{errors.privacy.message}</p>}

      <div>
        <Button type="submit" variant="mark" size="lg" disabled={isSubmitting}>
          <Send className="h-5 w-5" /> Verstuur aanvraag
        </Button>
        <p className="mt-3 text-xs text-text-muted">
          Liever direct? Bel{" "}
          <a href={company.phone.href} className="font-semibold text-mark-strong underline">
            {company.phone.display}
          </a>{" "}
          — voor een APK kunt u ook zonder afspraak langskomen.
        </p>
      </div>
    </form>
  );
}
