import type { VehicleIconKey } from "@/data/vehicles";

interface VehicleIconProps {
  name: VehicleIconKey;
  className?: string;
}

/**
 * Custom line icons for the four vehicle types, drawn in the same thin-stroke
 * style as the logo artwork. Decorative — labels always accompany them, so the
 * SVG is aria-hidden.
 */
export function VehicleIcon({ name, className }: VehicleIconProps) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    className,
  };

  switch (name) {
    case "car":
      return (
        <svg {...common}>
          <path d="M2.5 14l2-4.6A2 2 0 0 1 6.3 8h7a2 2 0 0 1 1.5.7L17.5 12h2.7A1.8 1.8 0 0 1 22 13.8V16h-2.3M6.6 16h6.8" />
          <circle cx="7.3" cy="16.6" r="2.1" />
          <circle cx="16.9" cy="16.6" r="2.1" />
        </svg>
      );
    case "motor":
      return (
        <svg {...common}>
          <circle cx="5" cy="16" r="3.1" />
          <circle cx="19" cy="16" r="3.1" />
          <path d="M8 16l3-5h4l1.8 2.6M11 11h5M15.5 8.8H18l1.6 4.2M8.1 16h7.7" />
        </svg>
      );
    case "scooter":
      return (
        <svg {...common}>
          <circle cx="5.6" cy="16.6" r="2.4" />
          <circle cx="18.4" cy="16.6" r="2.4" />
          <path d="M6.2 8.6h2.6l1.4 8M8 16.6h8l-1-4.2H9.4M16.2 16.6l1.1-8h1.5" />
        </svg>
      );
    case "boat":
      return (
        <svg {...common}>
          <path d="M3.8 14h16.4l-1.7 4.2a2 2 0 0 1-1.9 1.3H7.4a2 2 0 0 1-1.9-1.3z" />
          <path d="M12 14V5l6.5 7M12 8.5H8.4a2 2 0 0 0-2 2V14" />
        </svg>
      );
    default:
      return null;
  }
}
