import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { labelClass, inputClass, errorClass } from "./fieldStyles";
import { services } from "@/data/services";
import { company } from "@/data/company";

/**
 * Offerte form. Fields mirror the current site's offerteformulier (Aanhef, Naam,
 * E-mail, Telefoon, Straat, Huisnummer, Postcode, Woonplaats, Werkzaamheden) plus
 * a service picker. Frontend-only demo: on submit it does NOT send anything to a
 * server (no backend in this phase) — it shows a success state. A real lead
 * endpoint goes behind a backend later (VITE_LEAD_ENDPOINT). See .env.example.
 */
const schema = z.object({
  aanhef: z.enum(["dhr", "mvr"], { errorMap: () => ({ message: "Kies een aanhef" }) }),
  naam: z.string().min(2, "Vul uw naam in"),
  email: z.string().email("Vul een geldig e-mailadres in"),
  telefoon: z.string().min(8, "Vul een geldig telefoonnummer in"),
  straat: z.string().min(2, "Vul uw straatnaam in"),
  huisnummer: z.string().min(1, "Vul uw huisnummer in"),
  postcode: z.string().min(4, "Vul uw postcode in"),
  woonplaats: z.string().min(2, "Vul uw woonplaats in"),
  dienst: z.string().optional(),
  bericht: z.string().min(10, "Geef kort aan welke werkzaamheden u wenst"),
});

type FormValues = z.infer<typeof schema>;

export function QuoteForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    // Demo: no backend. Log locally and show confirmation. Never post lead data
    // to a third party from the browser.
    console.info("Offerteaanvraag (demo, niet verzonden):", values);
    await new Promise((r) => setTimeout(r, 400));
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-line bg-surface p-8 text-center shadow-soft">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-strong" aria-hidden="true" />
        <h2 className="mt-4 text-2xl">Bedankt voor uw aanvraag</h2>
        <p className="mt-2 text-text-body">
          Dit is een demo-formulier, dus er is nog niets verzonden. In de definitieve website
          ontvangt All-in Daktechniek uw aanvraag en nemen zij zo snel mogelijk contact met u op.
        </p>
        <p className="mt-4 text-sm text-text-muted">
          Liever direct contact? Bel{" "}
          <a href={company.phonePrimary.href} className="font-semibold text-green-strong">
            {company.phonePrimary.display}
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
      <fieldset>
        <legend className={labelClass}>Aanhef</legend>
        <div className="mt-2 flex gap-4">
          <label className="flex items-center gap-2 text-sm text-text-body">
            <input type="radio" value="dhr" {...register("aanhef")} /> Dhr.
          </label>
          <label className="flex items-center gap-2 text-sm text-text-body">
            <input type="radio" value="mvr" {...register("aanhef")} /> Mevr.
          </label>
        </div>
        {errors.aanhef && <p className={errorClass}>{errors.aanhef.message}</p>}
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="naam" className={labelClass}>Naam *</label>
          <input id="naam" className={inputClass(!!errors.naam)} {...register("naam")} />
          {errors.naam && <p className={errorClass}>{errors.naam.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>E-mailadres *</label>
          <input id="email" type="email" className={inputClass(!!errors.email)} {...register("email")} />
          {errors.email && <p className={errorClass}>{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="telefoon" className={labelClass}>Telefoonnummer *</label>
          <input id="telefoon" type="tel" className={inputClass(!!errors.telefoon)} {...register("telefoon")} />
          {errors.telefoon && <p className={errorClass}>{errors.telefoon.message}</p>}
        </div>
        <div>
          <label htmlFor="dienst" className={labelClass}>Gewenste dienst</label>
          <select id="dienst" className={inputClass(false)} {...register("dienst")}>
            <option value="">Maak een keuze (optioneel)</option>
            {services.map((s) => (
              <option key={s.slug} value={s.title}>{s.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-6">
        <div className="sm:col-span-4">
          <label htmlFor="straat" className={labelClass}>Straatnaam *</label>
          <input id="straat" className={inputClass(!!errors.straat)} {...register("straat")} />
          {errors.straat && <p className={errorClass}>{errors.straat.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="huisnummer" className={labelClass}>Huisnummer *</label>
          <input id="huisnummer" className={inputClass(!!errors.huisnummer)} {...register("huisnummer")} />
          {errors.huisnummer && <p className={errorClass}>{errors.huisnummer.message}</p>}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="postcode" className={labelClass}>Postcode *</label>
          <input id="postcode" className={inputClass(!!errors.postcode)} {...register("postcode")} />
          {errors.postcode && <p className={errorClass}>{errors.postcode.message}</p>}
        </div>
        <div className="sm:col-span-4">
          <label htmlFor="woonplaats" className={labelClass}>Woonplaats *</label>
          <input id="woonplaats" className={inputClass(!!errors.woonplaats)} {...register("woonplaats")} />
          {errors.woonplaats && <p className={errorClass}>{errors.woonplaats.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="bericht" className={labelClass}>Gewenste werkzaamheden *</label>
        <textarea
          id="bericht"
          rows={5}
          placeholder="Licht uw gewenste werkzaamheden of probleem zo goed mogelijk toe."
          className={inputClass(!!errors.bericht)}
          {...register("bericht")}
        />
        {errors.bericht && <p className={errorClass}>{errors.bericht.message}</p>}
      </div>

      <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? "Versturen…" : company.cta.quote}
      </Button>
      <p className="text-xs text-text-muted">
        Door te verzenden gaat u ermee akkoord dat wij uw gegevens gebruiken om contact met u op te
        nemen over uw aanvraag.
      </p>
    </form>
  );
}
