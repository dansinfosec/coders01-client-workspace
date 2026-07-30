import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { primaryNav } from "@/data/navigation";
import { cn } from "@/utils/cn";

/** Desktop navigation with accessible hover/click dropdowns. */
export function DesktopNav() {
  const [open, setOpen] = useState<number | null>(null);
  const navRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Close on route change and on outside click / Escape.
  useEffect(() => setOpen(null), [location.pathname]);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setOpen(null);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(null);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "px-2 py-2 text-sm font-semibold transition-colors",
      isActive ? "text-mark-strong" : "text-text-strong hover:text-mark-strong",
    );

  return (
    <div ref={navRef} className="hidden items-center gap-1 lg:flex">
      {primaryNav.map((item, i) =>
        item.children ? (
          <div
            key={item.label}
            className="relative"
            onMouseEnter={() => setOpen(i)}
            onMouseLeave={() => setOpen(null)}
          >
            <button
              type="button"
              aria-expanded={open === i}
              aria-haspopup="true"
              onClick={() => setOpen(open === i ? null : i)}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-2 text-sm font-semibold transition-colors",
                open === i ? "text-mark-strong" : "text-text-strong hover:text-mark-strong",
              )}
            >
              {item.label}
              <ChevronDown className={cn("h-4 w-4 transition-transform", open === i && "rotate-180")} />
            </button>
            {open === i && (
              <div
                className={cn(
                  "absolute left-0 top-full z-50 mt-1 rounded-xl border border-line bg-surface p-2 shadow-card",
                  item.children.length > 8 ? "grid w-[34rem] grid-cols-2 gap-0.5" : "w-64",
                )}
                role="menu"
              >
                {item.children.map((child) => (
                  <Link
                    key={child.to}
                    to={child.to}
                    role="menuitem"
                    className="block rounded-lg px-3 py-2 text-sm text-text-body hover:bg-surface-muted hover:text-text-strong"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <NavLink key={item.label} to={item.to!} end={item.to === "/"} className={linkClass}>
            {item.label}
          </NavLink>
        ),
      )}
    </div>
  );
}
