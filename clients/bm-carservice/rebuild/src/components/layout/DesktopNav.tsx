import { useEffect, useId, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { primaryNav, type NavItem } from "@/data/navigation";
import { cn } from "@/utils/cn";

function isItemActive(item: NavItem, pathname: string): boolean {
  if (item.to === "/") return pathname === "/";
  if (pathname === item.to || pathname.startsWith(`${item.to}/`)) return true;
  return item.children?.some((c) => c.to !== "/" && (pathname === c.to || pathname.startsWith(`${c.to}/`))) ?? false;
}

function Dropdown({ item, active }: { item: NavItem; active: boolean }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        ref.current?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => ref.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus());
          }
        }}
        className={cn(
          "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
          active ? "text-mark-strong" : "text-text-strong hover:text-mark-strong",
        )}
      >
        {item.label}
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>
      {/* Flush to the trigger (top-full, no gap) so moving the mouse in doesn't close it. */}
      {open && (
        <div id={menuId} role="menu" className="absolute left-0 top-full z-50 pt-2">
          <ul className="w-64 rounded-xl border border-line bg-surface p-2 shadow-card">
            {item.children!.map((child) => (
              <li key={child.to}>
                <Link
                  to={child.to}
                  role="menuitem"
                  className="block rounded-lg px-3 py-2 text-sm text-text-body hover:bg-surface-muted hover:text-text-strong focus-visible:bg-surface-muted focus-visible:outline-none"
                >
                  {child.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/** Desktop navigation (lg+). Accessible hover/click dropdowns, active-route aware. */
export function DesktopNav() {
  const { pathname } = useLocation();
  return (
    <nav aria-label="Hoofdnavigatie" className="hidden items-center gap-0.5 lg:flex">
      {primaryNav.map((item) => {
        const active = isItemActive(item, pathname);
        return item.children ? (
          <Dropdown key={item.label} item={item} active={active} />
        ) : (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.to === "/"}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
              active ? "text-mark-strong" : "text-text-strong hover:text-mark-strong",
            )}
          >
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
