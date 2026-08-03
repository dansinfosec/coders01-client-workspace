import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StickyBar } from "@/components/layout/StickyBar";
import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { VehicleCategories } from "@/components/sections/VehicleCategories";
import { Services } from "@/components/sections/Services";
import { Business } from "@/components/sections/Business";
import { Insurance } from "@/components/sections/Insurance";
import { Process } from "@/components/sections/Process";
import { Gallery } from "@/components/sections/Gallery";
import { About } from "@/components/sections/About";
import { LocationContact } from "@/components/sections/LocationContact";
import { SchadeForm } from "@/components/sections/SchadeForm";

export default function App() {
  return (
    <>
      <a href="#hoofdinhoud" className="skip-link">Naar hoofdinhoud</a>
      <SiteHeader />
      <main id="hoofdinhoud">
        <Hero />
        <TrustStrip />
        <VehicleCategories />
        <Services />
        <Business />
        <Insurance />
        <Process />
        <Gallery />
        <About />
        <LocationContact />
        <SchadeForm />
      </main>
      <SiteFooter />
      <StickyBar />
    </>
  );
}
