"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { ACCENT_TEXT } from "@/lib/accent";
import { NAV_ITEMS, isActive } from "./nav-items";

/**
 * Mobile bottom navigation.
 *
 * Sits above the iOS home indicator via the safe-area inset, and every target
 * is a full-height column so the tap area comfortably clears 44px.
 */
export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      <div className="pointer-events-none absolute inset-x-0 -top-8 h-8 bg-gradient-to-t from-ink-900 to-transparent" />
      <ul className="relative grid grid-cols-5 border-t border-white/8 bg-ink-950/85 backdrop-blur-xl">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item);
          const Icon = item.icon;

          return (
            <li key={item.href} className="contents">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "group relative flex min-h-[4rem] flex-col items-center justify-center gap-1 px-1 pt-2.5 pb-2 text-[0.68rem] font-semibold tracking-tight transition-colors",
                  active ? ACCENT_TEXT[item.accent] : "text-faint hover:text-mist",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-0 h-0.5 w-8 rounded-full transition-all duration-300",
                    active ? "bg-current opacity-100" : "opacity-0",
                  )}
                />
                <Icon
                  aria-hidden
                  className={cn(
                    "size-[1.35rem] transition-transform duration-300",
                    active && "scale-110",
                  )}
                  strokeWidth={active ? 2.4 : 1.9}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
