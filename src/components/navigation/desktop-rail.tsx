"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, Settings } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_TEXT } from "@/lib/accent";
import { NAV_ITEMS, isActive } from "./nav-items";
import { useProfile } from "@/hooks/use-profile";
import { getLevelProgress } from "@/lib/xp";
import { formatXp } from "@/lib/format";
import { ProgressBar } from "@/components/ui/primitives";
import { Mark, Wordmark } from "@/components/layout/wordmark";

/**
 * Desktop navigation.
 *
 * Not a stretched phone: the rail carries the wordmark, the full labels with
 * their descriptions, and a live progress summary that the mobile layout puts
 * on Home instead.
 */
export function DesktopRail() {
  const pathname = usePathname();
  const { profile, ready } = useProfile();
  const level = getLevelProgress(profile.xp);

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[17rem] flex-col border-r border-white/8 bg-ink-950/60 px-5 py-7 backdrop-blur-xl lg:flex">
      <Link href="/" className="mb-8 inline-flex px-1">
        <Wordmark />
      </Link>

      <nav aria-label="Primary" className="flex-1">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "group flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors",
                    active ? "bg-white/8" : "hover:bg-white/5",
                  )}
                >
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-xl transition-colors",
                      item.isPrimary
                        ? active
                          ? "bg-quest-500 text-white"
                          : "bg-quest-600 text-white"
                        : active
                          ? cn("bg-white/8", ACCENT_TEXT[item.accent])
                          : "text-faint group-hover:text-mist",
                    )}
                  >
                    {item.isPrimary ? (
                      <Mark
                        className="size-[1.15rem] text-white"
                        style={
                          {
                            "--sq-mark-knockout": active ? "#6e56f8" : "#573fdb",
                          } as React.CSSProperties
                        }
                      />
                    ) : (
                      <Icon aria-hidden className="size-[1.15rem]" strokeWidth={active ? 2.3 : 1.9} />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span
                      className={cn(
                        "block text-sm font-semibold",
                        active ? "text-chalk" : "text-mist group-hover:text-chalk",
                      )}
                    >
                      {item.label}
                    </span>
                    <span className="block truncate text-xs text-faint">{item.description}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="my-5 h-px bg-white/8" />

        <ul className="flex flex-col gap-1">
          <li>
            <Link
              href="/radio"
              className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-mist transition-colors hover:bg-white/5 hover:text-chalk"
            >
              <Radio aria-hidden className="size-[1.05rem] text-faint" />
              Radio
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className="flex items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-mist transition-colors hover:bg-white/5 hover:text-chalk"
            >
              <Settings aria-hidden className="size-[1.05rem] text-faint" />
              Settings and demo
            </Link>
          </li>
        </ul>
      </nav>

      <div className="sq-card-flat mt-6 p-4">
        <div className="flex items-baseline justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-faint">
            Level {ready ? level.level : 1}
          </p>
          <p className="font-display text-sm font-bold text-volt-300 tabular-nums">
            {ready ? formatXp(profile.xp) : 0} XP
          </p>
        </div>
        <p className="mt-0.5 font-display text-base font-bold text-chalk">
          {ready ? level.title : "Rookie"}
        </p>
        <ProgressBar
          className="mt-3"
          value={ready ? level.fraction : 0}
          label="Progress to next level"
        />
        <p className="mt-2 text-xs text-faint">
          {ready && !level.isMaxLevel
            ? `${level.xpForNextLevel} XP to level ${level.level + 1}`
            : "Top level reached"}
        </p>
      </div>
    </aside>
  );
}
