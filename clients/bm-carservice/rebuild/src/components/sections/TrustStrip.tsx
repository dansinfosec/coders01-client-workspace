import { ShieldCheck, BadgeCheck, Wrench, LifeBuoy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { company } from "@/data/company";
import { Container } from "@/components/ui/Container";

const icons: LucideIcon[] = [ShieldCheck, LifeBuoy, BadgeCheck, Wrench];

/** Row of verified trust signals (RDW / ANWB / garantie / onderdelen). */
export function TrustStrip() {
  return (
    <div className="border-y border-line bg-surface-muted">
      <Container className="grid grid-cols-2 gap-px overflow-hidden lg:grid-cols-4">
        {company.trust.map((item, i) => {
          const Icon = icons[i % icons.length]!;
          return (
            <div key={item.label} className="flex items-center gap-3 bg-surface-muted px-4 py-5">
              <Icon className="h-6 w-6 shrink-0 text-mark" />
              <div>
                <p className="font-display text-sm font-bold leading-tight text-text-strong">
                  {item.label}
                </p>
                <p className="text-xs text-text-muted">{item.detail}</p>
              </div>
            </div>
          );
        })}
      </Container>
    </div>
  );
}
