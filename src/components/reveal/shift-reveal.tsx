import type { ReactNode } from "react";

import { cn } from "@/lib/cn";
import { ACCENT_TEXT, type Accent } from "@/lib/accent";

/**
 * The shared grammar for "something changed".
 *
 * All four signature experiences end by comparing two states: REWIND compares
 * the first run with the rewound one, Norm Mirror compares a prediction with a
 * demo aggregate, BREAKSAFE compares an environment before and after, and Crew
 * Shift compares a group before and after it talked. They are different games
 * and they should stay different games, so this is deliberately not a layout
 * that swallows their content. It is a frame: two labelled states, a connector
 * that says which way time runs, and one line underneath saying what moved.
 *
 * It renders no card. The previous pass spent its effort removing card soup and
 * a comparison nested inside a card inside a card is exactly how that comes
 * back. Structure here comes from typography, a hairline and spacing.
 *
 * Both states are always present in the DOM. Nothing is revealed by motion and
 * nothing is hidden without it, which is what makes the reduced-motion path
 * identical rather than merely acceptable.
 */
export function ShiftReveal({
  beforeLabel,
  afterLabel,
  before,
  after,
  connector,
  summary,
  layout = "stacked",
  accent = "volt",
  className,
}: {
  beforeLabel: string;
  afterLabel: string;
  before: ReactNode;
  after: ReactNode;
  /** Small glyph sitting in the rule between the two states. */
  connector?: ReactNode;
  /** One sentence naming what moved. Rendered below both states. */
  summary?: ReactNode;
  /**
   * `stacked` puts the after state below the before state, sharing a left
   * baseline, which is the readable default on a 390px phone. `side-by-side`
   * exists for content that is inherently spatial, like the BREAKSAFE mock,
   * where two narrow columns beat two short rows.
   */
  layout?: "stacked" | "side-by-side";
  accent?: Accent;
  className?: string;
}) {
  if (layout === "side-by-side") {
    return (
      <div className={className}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <StateLabel>{beforeLabel}</StateLabel>
            <div className="mt-2">{before}</div>
          </div>
          <div>
            <StateLabel accent={accent}>{afterLabel}</StateLabel>
            <div className="mt-2">{after}</div>
          </div>
        </div>
        {summary ? <ShiftSummary>{summary}</ShiftSummary> : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <StateLabel>{beforeLabel}</StateLabel>
      <div className="mt-2.5">{before}</div>

      <div aria-hidden className="my-4 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/10" />
        {connector ? <span className={ACCENT_TEXT[accent]}>{connector}</span> : null}
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <StateLabel accent={accent}>{afterLabel}</StateLabel>
      <div className="mt-2.5">{after}</div>

      {summary ? <ShiftSummary>{summary}</ShiftSummary> : null}
    </div>
  );
}

function StateLabel({ children, accent }: { children: ReactNode; accent?: Accent }) {
  return (
    <p
      className={cn(
        "text-[0.65rem] font-semibold uppercase tracking-[0.12em]",
        accent ? ACCENT_TEXT[accent] : "text-faint",
      )}
    >
      {children}
    </p>
  );
}

function ShiftSummary({ children }: { children: ReactNode }) {
  return <p className="mt-5 text-sm leading-relaxed text-mist">{children}</p>;
}

/* ------------------------------------------------------------ Tally rows */

export interface TallyRow {
  id: string;
  label: string;
  count: number;
  /** Optional second line, e.g. what the option costs. */
  note?: string;
}

/**
 * A distribution of whole answers, drawn as bars on one shared baseline.
 *
 * Cleveland and McGill (1984) rank position along a common scale first for
 * accuracy and area near the bottom, which is why this is bars and not a pie,
 * and why the before and after tallies share both the baseline and the row
 * order. Rows are never re-sorted by count: if a row moves, the movement is the
 * signal, and re-sorting would destroy it.
 *
 * Counts are shown as integers. Four people are counts, not percentages, and
 * "75%" for three of four claims a precision that does not exist.
 */
export function TallyBars({
  rows,
  total,
  accent = "pulse",
  animate = false,
  showNotes = false,
}: {
  rows: TallyRow[];
  total: number;
  accent?: Accent;
  /** One-shot width transition. Callers pass false under reduced motion. */
  animate?: boolean;
  showNotes?: boolean;
}) {
  const fill: Record<Accent, string> = {
    quest: "bg-quest-500",
    pulse: "bg-pulse-500",
    volt: "bg-volt-500",
    coral: "bg-coral-500",
    gold: "bg-gold-500",
  };

  return (
    <ul className="space-y-2.5">
      {rows.map((row) => {
        const fraction = total > 0 ? row.count / total : 0;
        return (
          <li key={row.id}>
            <div className="flex items-baseline justify-between gap-3">
              <p
                className={cn(
                  "text-sm leading-snug font-medium",
                  row.count > 0 ? "text-chalk" : "text-faint",
                )}
              >
                {row.label}
              </p>
              <span
                className={cn(
                  "shrink-0 text-sm font-bold tabular-nums",
                  row.count > 0 ? ACCENT_TEXT[accent] : "text-faint",
                )}
              >
                {row.count}
              </span>
            </div>

            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/8">
              <div
                className={cn(
                  "h-full rounded-full",
                  fill[accent],
                  animate && "transition-[width] duration-700 ease-out",
                )}
                style={{ width: `${fraction * 100}%` }}
              />
            </div>

            {showNotes && row.note ? (
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{row.note}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
