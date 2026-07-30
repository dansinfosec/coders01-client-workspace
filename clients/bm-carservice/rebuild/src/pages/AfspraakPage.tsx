import { Phone, MessageCircle, MapPin } from "lucide-react";
import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { OpeningHours } from "@/components/sections/OpeningHours";
import { Section } from "@/components/ui/Section";
import { AppointmentForm } from "@/components/forms/AppointmentForm";
import { company } from "@/data/company";

const whatsappUrl = `https://wa.me/${company.phone.whatsapp}`;

export function AfspraakPage() {
  return (
    <>
      <SEO
        title="Afspraak maken | BM Carservice Amstelveen"
        description="Maak online een afspraak bij BM Carservice in Amstelveen voor APK, onderhoud of reparatie. Voor een APK kunt u ook zonder afspraak langskomen."
        path="/afspraak"
      />
      <PageHero
        eyebrow="Afspraak"
        title="Maak een afspraak"
        intro="Vul het formulier in, dan nemen we contact op om uw afspraak te bevestigen. Voor een APK kunt u ook gewoon binnenlopen."
        crumbs={[{ label: "Home", to: "/" }, { label: "Afspraak" }]}
      />
      <Section tone="default">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <AppointmentForm />
          </div>
          <aside className="space-y-6 lg:col-span-5">
            <div className="rounded-2xl border border-line bg-surface-muted p-6">
              <h2 className="text-lg">Liever direct contact?</h2>
              <div className="mt-4 grid gap-3 text-sm">
                <a href={company.phone.href} className="inline-flex items-center gap-2.5 font-semibold text-text-strong hover:text-mark-strong">
                  <Phone className="h-4 w-4 text-mark" /> {company.phone.display}
                </a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 font-semibold text-text-strong hover:text-mark-strong">
                  <MessageCircle className="h-4 w-4 text-mark" /> WhatsApp ons
                </a>
                <a href={company.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2.5 text-text-body hover:text-mark-strong">
                  <MapPin className="h-4 w-4 text-mark" /> {company.address.street}, {company.address.city}
                </a>
              </div>
            </div>
            <OpeningHours />
          </aside>
        </div>
      </Section>
    </>
  );
}
