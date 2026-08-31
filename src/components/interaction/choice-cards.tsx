"use client";

import { ArrowRight, Check } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_BORDER, ACCENT_BG_SOFT, ACCENT_TEXT, type Accent } from "@/lib/accent";
import type { ChoiceOption } from "@/types/interaction";

/**
 * The one choice list.
 *
 * This markup existed in seven places, character for character, and had begun
 * to drift: two of them had a hover border, one had a tone ring, one had
 * neither, and the Streets copies had lost the accent entirely. A choice is
 * the single most repeated interaction in the product, so it is worth exactly
 * one implementation.
 *
 * ---
 *
 * ## The design rules it enforces
 *
 * **Options are actions, not answers.** No A/B/C/D, no letters, no scoring
 * colour before a choice is made. "Talk to her privately" is a thing a person
 * does. "C) Speaking privately" is a thing a person picks on a test, and the
 * difference in how it feels to a sixteen year old is most of this pass.
 *
 * **Nothing signals the approved option.** Every card is drawn identically
 * until it is chosen. A safest option is named in the consequence afterwards,
 * never marked before, because a visible tell converts a rehearsal into a
 * guessing game and the whole point is to find out what somebody would
 * actually do.
 *
 * **Distractors are plausible human actions, and every one gets resolved.**
 * Roediger and Marsh (2005) showed that committing to a plausible wrong
 * alternative can leave it feeling familiar later, and that the effect grows
 * with the number of alternatives. Little, Bjork, Bjork and Angello (2012)
 * showed the other half: a choice is a genuine retrieval event only when the
 * alternatives are competitive enough that ruling one out requires actually
 * recalling why. So a filler option is worse than useless, because it carries
 * the exposure cost without the retrieval benefit.
 *
 * The strict reading of the option-count evidence is two or three, and this
 * product uses up to four in a Prevention Thread. That is a deliberate
 * departure and the reason is Butler and Roediger (2008): unresolved
 * multiple choice left learners producing MORE false answers than never
 * testing them at all, while feedback returned them to baseline. The risk is
 * carried by the commitment, not by the reading, and every selection here is
 * immediately followed by option-specific feedback with the safer move named.
 * That is what `Consequence` is, and it is not optional. Four options with a
 * guaranteed correction is the shape the evidence supports; six with no
 * correction is the shape that measurably implants misinformation.
 *
 * **Touch targets are 56px.** `min-h-14`, which clears the 44px floor with
 * room for two lines of label on a 390px screen.
 */
export function ChoiceCards({
  options,
  onChoose,
  /** For multi-select surfaces such as the BREAKSAFE patch bench. */
  selectedIds,
  accent,
  /** Accessible group label. Rendered visually only when `showLegend`. */
  legend,
  showLegend = false,
  className,
}: {
  options: readonly ChoiceOption[];
  onChoose: (id: string) => void;
  selectedIds?: readonly string[];
  accent?: Accent;
  legend?: string;
  showLegend?: boolean;
  className?: string;
}) {
  const multi = selectedIds !== undefined;

  return (
    <div
      role="group"
      aria-label={legend}
      className={cn("space-y-2.5", className)}
    >
      {showLegend && legend ? (
        <p className="text-xs font-semibold tracking-[0.12em] text-faint uppercase">{legend}</p>
      ) : null}

      {options.map((option) => {
        const Icon = option.icon;
        const selected = selectedIds?.includes(option.id) ?? false;

        return (
          <button
            key={option.id}
            type="button"
            disabled={option.disabled}
            /*
             * `aria-pressed` only where pressing is a toggle. On a
             * single-choice list the button navigates rather than latches, and
             * announcing "not pressed" on four options in a row is noise.
             */
            aria-pressed={multi ? selected : undefined}
            onClick={() => onChoose(option.id)}
            className={cn(
              "sq-pressable flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-[0.95rem] leading-snug font-medium",
              option.disabled
                ? "cursor-not-allowed border-white/8 bg-white/2 text-faint"
                : selected && accent
                  ? cn(ACCENT_BORDER[accent], ACCENT_BG_SOFT[accent], "text-chalk")
                  : selected
                    ? "border-volt-500/45 bg-volt-500/10 text-chalk"
                    : "border-white/10 bg-white/4 text-chalk hover:bg-white/7",
            )}
          >
            {Icon ? (
              <Icon
                aria-hidden
                className={cn(
                  "size-5 shrink-0",
                  selected && accent ? ACCENT_TEXT[accent] : "text-faint",
                )}
              />
            ) : null}

            <span className="min-w-0 flex-1">
              <span className="block">{option.label}</span>
              {option.hint ? (
                <span className="mt-0.5 block text-xs leading-snug font-normal text-muted">
                  {option.hint}
                </span>
              ) : null}
            </span>

            {multi ? (
              <span
                aria-hidden
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-md border",
                  selected
                    ? "border-transparent bg-volt-500 text-ink-900"
                    : "border-white/20 text-transparent",
                )}
              >
                <Check className="size-3.5" strokeWidth={3} />
              </span>
            ) : (
              <ArrowRight aria-hidden className="size-4 shrink-0 text-faint" />
            )}
          </button>
        );
      })}
    </div>
  );
}
