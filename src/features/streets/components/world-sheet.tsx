"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/cn";

/**
 * The surface every world conversation opens on.
 *
 * ---
 *
 * ## Why it changes shape with the screen
 *
 * A bottom sheet is right on a phone held upright: it rises from the thumb,
 * it is easy to reach, and the world above it stays in view.
 *
 * Held sideways it is wrong. A full width sheet across a landscape screen
 * covers the district with a wall of text, and every conversation turns
 * Streets back into a dark app with a form in it. Landscape has width to
 * spare and no height, so the sheet becomes a **panel down one side** and the
 * world stays where the player left it.
 *
 * That is not decoration. Half the point of putting these conversations in a
 * world is that a person remembers **where** they had them.
 *
 * ## The scrim is deliberately weak
 *
 * The first version dimmed and blurred hard enough that the district behind
 * became unrecognisable, which threw away the thing the sheet was supposed to
 * be sitting in front of. It is now enough contrast to read against and no
 * more: in landscape there is no blur at all, because the panel is beside the
 * world rather than on top of it.
 */
export function WorldSheet({
  label,
  landscape,
  onClose,
  closeLabel = "Close",
  children,
}: {
  /** Accessible name of the dialog. */
  label: string;
  landscape: boolean;
  onClose: () => void;
  closeLabel?: string;
  children: ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-40 flex",
        landscape ? "justify-end bg-black/25" : "flex-col justify-end bg-black/45 backdrop-blur-[2px]",
      )}
    >
      <button
        type="button"
        aria-label={closeLabel}
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className={cn(
          "relative overflow-y-auto border-white/10 bg-ink-900/97 backdrop-blur",
          landscape
            /*
              A width, and a share of the screen, whichever is smaller.
              A fixed 26rem panel is 44% of a large phone and 62% of a small
              one, which is the difference between a panel beside the world and
              a panel with a slice of world left over.
            */
            ? "h-full w-[min(23rem,55%)] rounded-l-3xl border-l px-5 pt-[max(1rem,env(safe-area-inset-top))] pr-[max(1.25rem,env(safe-area-inset-right))] pb-[max(1rem,env(safe-area-inset-bottom))]"
            : "max-h-[85dvh] rounded-t-3xl border-t px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
