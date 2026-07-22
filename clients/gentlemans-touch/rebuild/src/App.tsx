import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { StickyBar } from "@/components/layout/StickyBar";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { About } from "@/components/sections/About";
import { Gallery } from "@/components/sections/Gallery";
import { Reviews } from "@/components/sections/Reviews";
import { OpeningHours } from "@/components/sections/OpeningHours";
import { LocationContact } from "@/components/sections/LocationContact";
import { Booking } from "@/components/sections/Booking";

export default function App() {
  return (
    <>
      <a href="#diensten" className="skip-link">Naar hoofdinhoud</a>
      <SiteHeader />
      {/* pb-16 leaves room for the fixed mobile action bar */}
      <main className="pb-16 lg:pb-0">
        <Hero />
        <Services />
        <About />
        <Gallery />
        <Reviews />
        <OpeningHours />
        <LocationContact />
        <Booking />
      </main>
      <SiteFooter />
      <StickyBar />
    </>
  );
}
