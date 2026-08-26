"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";

/**
 * The behavioural explanation, behind one tap.
 *
 * A debrief that opens with "Decision rehearsal. Replaying the same pivot with
 * a different response converts an abstract intention into a specific one"
 * turns the end of a game into the start of a lecture. The rigour is worth
 * keeping and the jargon is worth keeping, but neither belongs in the player's
 * path by default.
 *
 * So the visible debrief is what changed, in plain language, and the mechanism
 * sits under a disclosure for the minority who want it: teachers, organisers,
 * judges and the occasional curious player. Progressive disclosure, and the
 * default is the story.
 *
 * A real `<button>` with `aria-expanded`, not a `<details>`, so the open state
 * is announced and the styling stays consistent with the rest of the product.
 */
export function WhyThisWorks({
  children,
  label = "Why this works",
  className,
}: {
  children: React.ReactNode;
  label?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("mt-6", className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="sq-pressable flex min-h-11 w-full items-center justify-between gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 text-sm font-semibold text-mist hover:bg-white/6"
      >
        {label}
        <ChevronDown
          aria-hidden
          className={cn("size-4 shrink-0 transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open ? (
        <div className="mt-3 rounded-2xl border border-white/8 bg-white/3 p-4 text-sm leading-relaxed text-muted">
          {children}
        </div>
      ) : null}
    </div>
  );
}
