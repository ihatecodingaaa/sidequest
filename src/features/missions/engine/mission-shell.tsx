"use client";

import Link from "next/link";
import { X } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { ACCENT_SOLID, type Accent } from "@/lib/accent";

/**
 * Full-screen frame for every mission player.
 *
 * Mission routes sit outside the navigated shell on purpose: while a scenario
 * is running, nothing should compete with it. The only way out is the explicit
 * close control, which keeps the interaction deliberate.
 */
export function MissionShell({
  title,
  accent = "quest",
  progress,
  children,
  exitHref,
  footer,
}: {
  title: string;
  accent?: Accent;
  /** 0 to 1, or undefined to hide the bar. */
  progress?: number;
  children: ReactNode;
  exitHref: string;
  footer?: ReactNode;
}) {
  return (
    <div className="sq-app-bg flex min-h-dvh flex-col">
      <header
        className="sticky top-0 z-30 border-b border-white/8 bg-ink-950/80 backdrop-blur-xl"
        style={{ paddingTop: "var(--safe-top)" }}
      >
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-3">
          <Link
            href={exitHref}
            aria-label="Close mission"
            className="grid size-11 shrink-0 place-items-center rounded-full text-mist sq-pressable hover:bg-white/8 hover:text-chalk"
          >
            <X aria-hidden className="size-5" />
          </Link>
          <p className="min-w-0 flex-1 truncate font-display text-sm font-bold tracking-tight text-chalk">
            {title}
          </p>
        </div>
        {typeof progress === "number" ? (
          <div className="h-0.5 w-full bg-white/8">
            <div
              className={cn("h-full transition-[width] duration-500 ease-out", ACCENT_SOLID[accent])}
              style={{ width: `${Math.round(Math.min(1, Math.max(0, progress)) * 100)}%` }}
            />
          </div>
        ) : null}
      </header>

      {/*
        A column, not a block.

        This element already grew to fill the viewport, because it is flex-1 in
        a min-h-dvh column. What it could not do was let anything inside it use
        that height: a percentage height on a child of a block does not resolve
        against a flex derived height, so screens with little content left a
        few hundred pixels of reserved but unusable space above the footer.

        As a column it stacks and stretches its children exactly as a block
        did, and a child that asks for flex-1 can now take the slack. Nothing
        that does not ask for it moves.
      */}
      <main
        id="main"
        className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6"
        style={{ paddingBottom: footer ? "1rem" : "calc(2rem + var(--safe-bottom))" }}
      >
        {children}
      </main>

      {footer ? (
        <div
          className="sticky bottom-0 border-t border-white/8 bg-ink-950/85 backdrop-blur-xl"
          style={{ paddingBottom: "var(--safe-bottom)" }}
        >
          <div className="mx-auto w-full max-w-2xl px-4 py-3">{footer}</div>
        </div>
      ) : null}
    </div>
  );
}
