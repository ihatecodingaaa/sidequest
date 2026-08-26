"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";
import { ACCENT_TEXT } from "@/lib/accent";
import { Mark } from "@/components/layout/wordmark";
import { NAV_ITEMS, isActive, type NavItem } from "./nav-items";
import { useProfile } from "@/hooks/use-profile";

/**
 * Mobile bottom navigation.
 *
 * Safe is the elevated centre item. It is emphatically still a tab: it
 * navigates, it takes `aria-current`, and it carries a text label exactly like
 * its neighbours. The elevation says "important place", not "do something
 * now", which matters because tapping Safe must never dial, report or notify
 * anything by itself.
 *
 * It does not pulse. A control that animates forever in peripheral vision
 * cannot be ignored, and permanent motion on a safety affordance produces the
 * alarm fatigue it is trying to avoid.
 */
export function BottomNav() {
  const pathname = usePathname();
  const { profile, ready } = useProfile();

  // YouTube's "You" tab is carried by the avatar, not by the word: a personal
  // mark is one of the few genuinely conventional signifiers in mobile UI and
  // it says "your account" without depending on the label at all. SIDEQUEST
  // has no photograph, so the initial stands in for one.
  const initial = ready ? profile.displayName.trim().charAt(0).toUpperCase() : "";

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 lg:hidden"
      style={{ paddingBottom: "var(--safe-bottom)" }}
    >
      {/*
        Tall enough to sit behind the raised Safe mark, which protrudes about
        25px above the bar. A shorter fade leaves the mark floating on top of
        scrolling content with a hard edge.
      */}
      <div className="pointer-events-none absolute inset-x-0 -top-16 h-16 bg-gradient-to-t from-ink-900 to-transparent" />

      <ul className="relative grid grid-cols-5 border-t border-white/8 bg-ink-950/85 backdrop-blur-xl">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item);
          return (
            <li key={item.href} className="relative">
              {item.isPrimary ? (
                <PrimaryTab item={item} active={active} />
              ) : (
                <StandardTab
                  item={item}
                  active={active}
                  initial={item.href === "/you" ? initial : ""}
                />
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Every tab shares this so the labels sit on one baseline across the bar. */
const TAB_BASE =
  "group flex min-h-16 flex-col items-center justify-end gap-1 px-1 pt-2.5 pb-2 text-[0.68rem] font-semibold tracking-tight transition-colors";

function StandardTab({
  item,
  active,
  initial,
}: {
  item: NavItem;
  active: boolean;
  initial?: string;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(TAB_BASE, active ? ACCENT_TEXT[item.accent] : "text-faint hover:text-mist")}
    >
      <span
        aria-hidden
        className={cn(
          "absolute top-0 h-0.5 w-8 rounded-full bg-current transition-opacity duration-300",
          active ? "opacity-100" : "opacity-0",
        )}
      />
      {initial ? (
        <span
          aria-hidden
          className={cn(
            "grid size-[1.35rem] place-items-center rounded-full text-[0.6rem] font-bold transition-colors",
            active ? "bg-volt-500 text-ink-900" : "bg-white/12 text-mist",
          )}
        >
          {initial}
        </span>
      ) : (
        <Icon
          aria-hidden
          className={cn("size-[1.35rem] transition-transform duration-300", active && "scale-110")}
          strokeWidth={active ? 2.4 : 1.9}
        />
      )}
      {item.label}
    </Link>
  );
}

/**
 * The elevated Safe tab.
 *
 * The mark is absolutely positioned so it can rise above the bar without
 * changing the bar's height. The whole column stays the tap target: at 390px
 * that is roughly 78 by 64 CSS pixels, well beyond the 24px WCAG 2.2 AA
 * minimum and beyond the 44px AAA figure, and the label is part of it rather
 * than a separate decoration.
 */
function PrimaryTab({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(TAB_BASE, active ? "text-quest-300" : "text-mist hover:text-chalk")}
    >
      <span
        aria-hidden
        className={cn(
          "absolute bottom-[2.05rem] grid size-14 place-items-center rounded-[1.3rem] border transition-all duration-200 ease-out",
          "group-active:scale-95",
          active
            ? "border-quest-300/60 bg-quest-500 shadow-[0_10px_28px_-6px_rgba(110,86,248,0.85)]"
            : "border-white/12 bg-quest-600 shadow-[0_8px_22px_-8px_rgba(110,86,248,0.7)]",
        )}
      >
        <Mark
          className="size-7 text-white"
          // The knockout colour tracks the button so the arrow reads as a cut-out.
          style={{ "--sq-mark-knockout": active ? "#6e56f8" : "#573fdb" } as React.CSSProperties}
        />
      </span>
      {item.label}
    </Link>
  );
}
