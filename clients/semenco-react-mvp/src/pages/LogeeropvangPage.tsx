import { ServicePageTemplate } from "@/components/sections/ServicePageTemplate";
import { getServiceById } from "@/data/careServices";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { ROUTES } from "@/routes/paths";

/** Logeeropvang service page (route "/logeeropvang"). */
export function LogeeropvangPage() {
  const service = getServiceById("logeeropvang");
  if (!service) return <NotFoundPage />;

  return (
    <ServicePageTemplate
      service={service}
      metaDescription="Kleinschalige logeerweekenden bij Sem & Co op RCN Het Grote Bos in Doorn: maximaal vijf kinderen per bungalow, met rust, structuur en persoonlijke aandacht."
      cta={{
        title: "Benieuwd of logeren past?",
        description: "Aanmelden is vrijblijvend. We kijken samen wat passend is.",
        primaryLabel: "Aanmelden",
        primaryTo: ROUTES.aanmelden,
        secondaryLabel: "Neem contact op",
        secondaryTo: ROUTES.contact,
      }}
    />
  );
}
