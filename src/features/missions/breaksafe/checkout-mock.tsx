"use client";

import { Check, CircleHelp, ScanLine, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/cn";
import { CHECKOUT_HOTSPOTS, type CheckoutHotspot } from "@/data/breaksafe";

/**
 * A mock self-checkout terminal.
 *
 * The "before" variant is built to be genuinely ambiguous: the item list is
 * clipped, the scan confirmation is a two-word grey label, the correction path
 * needs staff, and the help control is loud. None of that describes how to
 * defeat a checkout. It describes why an honest shopper ends up unsure, which
 * is the actual subject of the mission.
 */

export function CheckoutMock({
  variant,
  onHotspot,
  foundIds = [],
  patches = [],
}: {
  variant: "before" | "after";
  onHotspot?: (hotspot: CheckoutHotspot) => void;
  foundIds?: string[];
  /** Patch ids applied, used to light up the improved terminal. */
  patches?: string[];
}) {
  const after = variant === "after";
  const has = (id: string) => patches.includes(id);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-3xl border transition-colors duration-500",
        // Hotspots are positioned by percentage, so the observe phase needs a
        // fixed box. The comparison view has none and must size to its content,
        // otherwise a narrow column forces the internals to overlap.
        onHotspot ? "aspect-[3/4]" : "h-full",
        after ? "border-volt-500/30 bg-ink-850" : "border-white/10 bg-ink-850",
      )}
    >
      {/* Terminal chrome */}
      <div className="flex items-center justify-between border-b border-white/8 px-4 py-2.5">
        <span className="font-display text-[0.7rem] font-bold tracking-[0.14em] text-faint uppercase">
          Self checkout
        </span>
        <span className="text-[0.7rem] font-semibold text-faint">Lane 4</span>
      </div>

      <div className={cn("flex flex-col p-3.5", onHotspot ? "h-[calc(100%-2.75rem)]" : "")}>
        {/* Scan status */}
        <div
          className={cn(
            "rounded-2xl border p-3 transition-all duration-500",
            after ? "border-volt-500/30 bg-volt-500/10" : "border-white/8 bg-white/3",
          )}
        >
          <div className="flex items-center gap-2.5">
            <ScanLine
              aria-hidden
              className={cn("size-4 shrink-0", after ? "text-volt-300" : "text-faint")}
            />
            {after && has("patch-confirmation") ? (
              <div className="min-w-0">
                <p className="font-display text-base leading-tight font-bold text-chalk">
                  Kopi O 3-in-1
                </p>
                <p className="text-sm font-semibold text-volt-300">Added &middot; $4.20</p>
              </div>
            ) : (
              <p className="text-[0.7rem] text-faint">item scanned</p>
            )}
          </div>
        </div>

        {/* Item list */}
        <div className={cn("mt-3", onHotspot ? "min-h-0 flex-1" : "")}>
          <p className="text-[0.6rem] font-semibold uppercase tracking-wider text-faint">
            {after && has("patch-confirmation") ? "Your basket (6 items)" : "Items"}
          </p>

          <ul
            className={cn(
              "mt-1.5 space-y-1",
              after && has("patch-confirmation") ? "" : "max-h-14 overflow-hidden",
            )}
          >
            {(after && has("patch-confirmation")
              ? ["Kopi O 3-in-1", "Wholemeal loaf", "Eggs, 10s", "Milk 1L", "Bananas", "Chilli sauce"]
              : ["Wholemeal loaf", "Eggs, 10s", "Milk 1L"]
            ).map((item) => (
              <li
                key={item}
                className={cn(
                  "flex items-center justify-between text-xs",
                  after && has("patch-confirmation") ? "text-mist" : "text-faint",
                )}
              >
                <span className="truncate">{item}</span>
                {after && has("patch-confirmation") ? (
                  <Check aria-hidden className="size-3 shrink-0 text-volt-400" />
                ) : null}
              </li>
            ))}
          </ul>

          {!after ? (
            <p className="mt-1 text-[0.6rem] text-faint">+3 more</p>
          ) : null}
        </div>

        {/* Weight alert */}
        <div
          className={cn(
            "mt-2 flex items-center gap-2 rounded-xl border px-2.5 py-2 transition-colors duration-500",
            after && has("patch-rescan")
              ? "border-white/8 bg-white/3"
              : "border-gold-500/25 bg-gold-500/10",
          )}
        >
          {after && has("patch-rescan") ? (
            <>
              <Check aria-hidden className="size-3.5 shrink-0 text-volt-400" />
              <p className="text-[0.7rem] text-mist">Bagging area looks right</p>
            </>
          ) : (
            <>
              <TriangleAlert aria-hidden className="size-3.5 shrink-0 text-gold-400" />
              <p className="text-[0.7rem] text-gold-400">Unexpected item in bagging area</p>
            </>
          )}
        </div>

        {/* Controls */}
        <div className="mt-2.5 grid grid-cols-2 gap-2">
          {after && has("patch-rescan") ? (
            <button
              type="button"
              disabled
              className="min-h-11 rounded-xl border border-volt-500/30 bg-volt-500/12 text-xs font-bold text-volt-300"
            >
              Rescan an item
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="min-h-11 rounded-xl border border-white/8 bg-white/3 text-[0.7rem] font-medium text-faint"
            >
              Remove item
              <span className="mt-0.5 block text-[0.55rem] text-faint">staff approval</span>
            </button>
          )}

          {after && has("patch-help") ? (
            <button
              type="button"
              disabled
              className="min-h-11 rounded-xl border border-pulse-500/30 bg-pulse-500/12 text-xs font-bold text-pulse-300"
            >
              Quiet help
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="relative min-h-11 rounded-xl border border-white/8 bg-white/3 text-[0.7rem] font-medium text-faint"
            >
              <CircleHelp aria-hidden className="mr-1 inline size-3" />
              Call assistant
              <span className="mt-0.5 block text-[0.55rem] text-faint">light + queue pause</span>
            </button>
          )}
        </div>

        <div className="mt-2.5 flex items-center justify-between rounded-xl bg-white/4 px-3 py-2">
          <span className="text-[0.65rem] font-semibold uppercase tracking-wider text-faint">
            Subtotal
          </span>
          <span className="font-display text-sm font-bold text-chalk tabular-nums">
            {after && has("patch-confirmation") ? "$21.35" : "$17.15"}
          </span>
        </div>
      </div>

      {/* Hotspots, only in the observe phase */}
      {onHotspot
        ? CHECKOUT_HOTSPOTS.map((hotspot) => {
            const found = foundIds.includes(hotspot.id);
            return (
              <button
                key={hotspot.id}
                type="button"
                onClick={() => onHotspot(hotspot)}
                aria-label={`Inspect: ${hotspot.label}`}
                style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
                className={cn(
                  "absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full transition-all duration-300",
                  found
                    ? "bg-volt-500/25 ring-2 ring-volt-400"
                    : "bg-white/10 ring-1 ring-white/25 hover:bg-white/20",
                )}
              >
                {found ? (
                  <Check aria-hidden className="size-4 text-volt-300" strokeWidth={3} />
                ) : (
                  <>
                    <span
                      aria-hidden
                      className="animate-pulse-ring absolute inset-0 rounded-full bg-quest-400/30"
                    />
                    <span aria-hidden className="size-2 rounded-full bg-quest-300" />
                  </>
                )}
              </button>
            );
          })
        : null}
    </div>
  );
}
