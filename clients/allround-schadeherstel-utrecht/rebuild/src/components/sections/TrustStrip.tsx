import { CarFront, Users, MessageSquareText, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Container";

const points = [
  { icon: CarFront, label: "Auto, motor, scooter en boot" },
  { icon: Users, label: "Particulier en zakelijk" },
  { icon: MessageSquareText, label: "Persoonlijk schadeadvies" },
  { icon: ShieldCheck, label: "Verzekeringsschade bespreekbaar" },
];

/** Neutral, verifiable trust points — no unproven partner/approval claims. */
export function TrustStrip() {
  return (
    <div className="border-y border-line bg-surface-muted/40">
      <Container>
        <ul className="grid grid-cols-1 gap-4 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {points.map((p) => (
            <li key={p.label} className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange/10 text-orange">
                <p.icon className="h-5 w-5" aria-hidden />
              </span>
              <span className="text-sm font-medium text-text-body">{p.label}</span>
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
