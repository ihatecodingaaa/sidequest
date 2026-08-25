import type { ReactNode } from "react";

import { BottomNav } from "@/components/navigation/bottom-nav";
import { DesktopRail } from "@/components/navigation/desktop-rail";
import { cn } from "@/lib/cn";

/**
 * The navigated shell. Full-screen mission players deliberately sit outside it
 * so nothing competes with the scenario while it is running.
 */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="sq-app-bg min-h-dvh">
      <DesktopRail />
      <div className="lg:pl-[17rem]">
        <main
          id="main"
          className={cn(
            "mx-auto w-full max-w-[46rem] px-4 pt-4 lg:max-w-[64rem] lg:px-8 lg:pt-8",
            // Clearance for the fixed bottom navigation, plus the home indicator.
            "pb-[calc(6.5rem+var(--safe-bottom))] lg:pb-16",
          )}
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  );
}

/** Page heading used by every secondary route. */
export function PageHeader({
  eyebrow,
  title,
  lede,
  action,
}: {
  eyebrow?: string;
  title: string;
  lede?: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-5 flex items-start justify-between gap-4">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.14em] text-quest-300">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display text-[1.75rem] leading-tight font-extrabold tracking-tight text-chalk lg:text-4xl">
          {title}
        </h1>
        {lede ? <p className="mt-2 max-w-prose text-sm text-mist lg:text-base">{lede}</p> : null}
      </div>
      {action ? <div className="shrink-0 pt-1">{action}</div> : null}
    </header>
  );
}
