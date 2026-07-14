import { ShieldCheck, MapPin, Layers, ClipboardCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { company } from "@/data/company";

/**
 * Trust strip — states only what is TRUE/verifiable (specialisme, werkgebied,
 * materialen, werkwijze). No invented stats, certifications or review counts.
 */
const items = [
  { icon: Layers, label: "Specialist in platte daken" },
  { icon: ShieldCheck, label: `Bitumen en EPDM` },
  { icon: MapPin, label: company.serviceArea },
  { icon: ClipboardCheck, label: "Advies na inspectie" },
];

export function TrustStrip() {
  return (
    <div className="border-y border-line-invert bg-navy-800">
      <Container className="grid grid-cols-2 gap-4 py-5 lg:grid-cols-4">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <div key={it.label} className="flex items-center gap-2.5 text-sm text-text-invert/90">
              <Icon className="h-5 w-5 shrink-0 text-green" aria-hidden="true" />
              <span className="font-medium">{it.label}</span>
            </div>
          );
        })}
      </Container>
    </div>
  );
}
