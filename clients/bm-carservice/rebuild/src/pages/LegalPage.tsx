import { SEO } from "@/components/SEO";
import { PageHero } from "@/components/sections/PageHero";
import { Section } from "@/components/ui/Section";
import { company } from "@/data/company";

type Kind = "cookiebeleid" | "privacy";

const copy: Record<Kind, { title: string; body: string[] }> = {
  cookiebeleid: {
    title: "Cookiebeleid",
    body: [
      "Deze website gebruikt functionele cookies die nodig zijn om de site goed te laten werken. Voor kaarten en eventuele analyse kunnen aanvullende cookies worden ingezet.",
      "De volledige, definitieve cookieverklaring wordt in overleg met BM Carservice opgesteld. Neem tot die tijd bij vragen contact op via " + company.email + ".",
    ],
  },
  privacy: {
    title: "Privacyverklaring",
    body: [
      "Wij gaan zorgvuldig om met uw gegevens. Gegevens die u via het afspraakformulier of per e-mail deelt, gebruiken we uitsluitend om contact met u op te nemen over uw aanvraag.",
      "De volledige, definitieve privacyverklaring wordt in overleg met BM Carservice opgesteld. Voor vragen over uw gegevens kunt u contact opnemen via " + company.email + ".",
    ],
  },
};

export function LegalPage({ kind }: { kind: Kind }) {
  const { title, body } = copy[kind];
  return (
    <>
      <SEO
        title={`${title} | BM Carservice`}
        description={`${title} van BM Carservice Amstelveen.`}
        path={`/${kind}`}
        noindex
      />
      <PageHero
        eyebrow="Juridisch"
        title={title}
        tone="concrete"
        crumbs={[{ label: "Home", to: "/" }, { label: title }]}
      />
      <Section tone="default" width="prose">
        <div className="space-y-4 text-text-body">
          {body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {/* TODO: definitieve cookie-/privacyteksten aanleveren door klant. */}
          <p className="text-sm text-text-muted">Laatst bijgewerkt: nog vast te stellen met de klant.</p>
        </div>
      </Section>
    </>
  );
}
