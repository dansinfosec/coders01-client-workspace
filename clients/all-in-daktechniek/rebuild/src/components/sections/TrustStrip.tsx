import { Users, Award, ShieldCheck, Search } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { company } from "@/data/company";

/**
 * Trust strip — ONLY facts stated on the current site. Guarantee is deliberately
 * NOT shown as a single company-wide number here, because the site states
 * different guarantees per service (see per-service pages). See CONTENT-INVENTORY.
 */
const items = [
  { icon: Users, label: company.trust.teamSize.value },
  { icon: Award, label: company.trust.experience.value },
  { icon: ShieldCheck, label: company.trust.vca.value },
  { icon: Search, label: company.trust.freeInspection.value },
];

export function TrustStrip() {
  return (
    <div className="border-y border-line bg-surface-muted">
      <Container className="grid grid-cols-2 gap-4 py-6 sm:grid-cols-4 sm:gap-6">
        {items.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-soft text-green-strong">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="text-sm font-semibold text-text-strong">{label}</span>
          </div>
        ))}
      </Container>
    </div>
  );
}
