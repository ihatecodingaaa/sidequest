"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";
import { useAudio } from "@/hooks/use-audio";

/**
 * What happened, then why it matters, then a way out.
 *
 * ---
 *
 * ## Why this is a component and not a convention
 *
 * Three surfaces were each rendering their own version of "you chose that, so
 * here is what happened", and they had drifted into three different shapes.
 * More importantly, the shape itself is load-bearing and easy to get wrong in
 * a way nobody notices in review.
 *
 * Butler and Roediger (2008) found that feedback both increases the benefit of
 * multiple-choice retrieval and reduces its characteristic cost, which is that
 * plausible wrong alternatives can feel familiar later. That result is the
 * reason a bare "+25 XP" after a choice is not enough: the corrective content
 * is doing the work, not the reward. Hattie and Timperley (2007) add the other
 * half, which is that feedback aimed at the *self* is the least effective of
 * the four levels they identify. So this component has a slot for what
 * happened and a slot for what it means, and no slot at all for a verdict
 * about the person who chose.
 *
 * ## The rules it encodes
 *
 * - **Consequence before explanation.** The world reacts, then the reason is
 *   offered. A paragraph of reasoning printed before the outcome is a lecture
 *   with a story attached.
 * - **One takeaway visible.** Depth goes behind `Why this`, which stays one
 *   tap away rather than four lines down. Real screenshots of this product
 *   showed a ten second encounter ending in a character line, a paragraph, a
 *   callout, an XP chip, a source paragraph, a button and a mascot line.
 * - **No verdict.** There is no `correct` prop, no tick, no cross, no red. An
 *   honest consequence for a riskier option says what did not happen and what
 *   would have worked, which is different from saying the player was wrong.
 * - **Riskier is still named.** Refusing to score a choice is not the same as
 *   pretending every choice is equally safe. `safer` carries the alternative
 *   move, in plain language, with no scolding attached.
 */
export function Consequence({
  /** What happened, in one or two sentences. The world reacting. */
  outcome,
  /**
   * The one line that is the lesson. Optional: many steps carry it at the end
   * of the thread rather than after every choice.
   */
  takeaway,
  /**
   * The move that would have worked better, when this option was meaningfully
   * riskier. Stated as an action, never as a correction of the person.
   */
  safer,
  /** Source and mechanism. Collapsed by default, always reachable. */
  why,
  whyLabel = "Why this",
  /** XP chip, progress line, official handoff. Rendered above the footer. */
  children,
  footer,
  className,
}: {
  outcome: string;
  takeaway?: string;
  safer?: string;
  why?: ReactNode;
  whyLabel?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const audio = useAudio();

  /*
   * The world reacting, once, on arrival.
   *
   * Deliberately not tied to whether the option was the safer one. A rising
   * cue for a good outcome and a falling one for a bad outcome would be a
   * score read out loud, and the whole grammar of this component is that there
   * is no score. It marks that something happened, and the words say what.
   */
  useEffect(() => {
    audio.play("consequence");
    // Once per consequence. The component is keyed by the choice that made it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("animate-rise", className)}>
      {/*
        `role="status"` rather than `aria-live` on a wrapper. The outcome
        arrives in response to the player's own action, so it should be
        announced once, politely, without the container re-reading itself every
        time the disclosure below it toggles.
      */}
      {outcome ? (
        <p role="status" className="text-[1.05rem] leading-relaxed text-chalk">
          {outcome}
        </p>
      ) : null}

      {safer ? (
        <p className="mt-2.5 text-sm leading-relaxed text-mist">
          <span className="font-semibold text-chalk">A safer move: </span>
          {safer}
        </p>
      ) : null}

      {takeaway ? (
        <p className="mt-4 rounded-2xl border border-volt-500/25 bg-volt-500/8 px-4 py-3 text-sm leading-relaxed font-semibold text-volt-300">
          {takeaway}
        </p>
      ) : null}

      {children}

      {why ? (
        <>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className="sq-pressable mt-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-mist hover:text-chalk"
          >
            {whyLabel}
            <ChevronDown
              aria-hidden
              className={cn("size-4 transition-transform", open && "rotate-180")}
            />
          </button>
          {open ? <div className="mt-1 text-xs leading-relaxed text-faint">{why}</div> : null}
        </>
      ) : null}

      {footer}
    </div>
  );
}
