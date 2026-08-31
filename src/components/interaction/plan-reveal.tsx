"use client";

import { useState } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/cn";
import { ChoiceCards } from "@/components/interaction/choice-cards";
import type { ChoiceOption } from "@/types/interaction";

/**
 * If it happens, then I will.
 *
 * ---
 *
 * ## Why this exists, and why it is two taps rather than one
 *
 * This is the highest-evidence mechanic in the whole interaction-first
 * research pass, and it is also the one this product did not have.
 *
 * The chain is honest and short. Choosing in a scenario produces an
 * intention, and Webb and Sheeran's meta-analysis of experimental evidence
 * found that a medium-to-large change in intention buys only a small-to-medium
 * change in behaviour (d+ = .36). Most of the gap is people who meant to act
 * and did not. The best-validated repair is an implementation intention: a
 * meta-analysis of 94 studies found a medium-to-large improvement in goal
 * attainment over merely forming an intention (d+ = 0.65), and the proposed
 * mechanism is that the cue becomes highly accessible, so the person
 * recognises the moment when it arrives instead of having to reason from
 * scratch inside it.
 *
 * The trap, named explicitly in the same research, is treating a branch as an
 * implementation intention. It is not. An implementation intention specifies
 * the **cue and the response and links them**, whereas a choice card
 * specifies only a response, inside a fictional situation the player will
 * never actually be standing in.
 *
 * So this asks for the missing half. The player picks when it would really
 * come up for them, the response is the one they already chose in the story,
 * and the two are shown joined. That is one extra tap, and it is the entire
 * difference between the mechanic and a decoration of it.
 *
 * ## What it does not do
 *
 * It makes no promise. There is no reminder, no notification, no streak and no
 * follow-up, because there is no push infrastructure and copy that implied one
 * would be a lie. Nothing is scored, nothing is stored beyond the choice the
 * thread already recorded, and the plan is the player's rather than the
 * product's: it is phrased in the first person and it is never read back as an
 * instruction.
 */
export function PlanReveal({
  /** The question above the cues. Written for this story. */
  prompt,
  /** When it might really come up. The player's half. */
  cues,
  /** What they chose in the story, as an action. */
  response,
  className,
}: {
  prompt: string;
  cues: readonly ChoiceOption[];
  response: string;
  className?: string;
}) {
  const [cueId, setCueId] = useState<string | null>(null);
  const cue = cues.find((entry) => entry.id === cueId);

  if (!cue) {
    return (
      <div className={cn("mt-5", className)}>
        <p className="text-sm font-semibold text-chalk">{prompt}</p>
        <ChoiceCards className="mt-2.5" options={cues} legend={prompt} onChoose={setCueId} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "animate-rise mt-5 rounded-2xl border border-volt-500/30 bg-volt-500/8 p-4",
        className,
      )}
    >
      <p className="flex items-center gap-2 text-xs font-bold tracking-[0.12em] text-volt-300 uppercase">
        <Check aria-hidden className="size-3.5" strokeWidth={3} />
        Your plan
      </p>

      {/*
        The grammar is the point, and it is the same grammar the reveals use:
        a labelled before state, a connector, a labelled after state, both
        permanently on screen. Here the before is the cue and the after is the
        response, joined by a hairline rather than boxed, because a comparison
        nested in a card inside a card is how card soup comes back.
      */}
      <p className="mt-2.5 text-[1.05rem] leading-relaxed text-chalk">
        <span className="text-mist">If </span>
        {cue.label.charAt(0).toLowerCase() + cue.label.slice(1)}
      </p>
      <span aria-hidden className="my-2.5 block h-px w-10 bg-white/20" />
      <p className="text-[1.05rem] leading-relaxed text-chalk">
        <span className="text-mist">I will </span>
        {response.charAt(0).toLowerCase() + response.slice(1)}
      </p>

      <p className="mt-3 text-xs leading-relaxed text-faint">
        Nothing here reminds you. Naming the moment in advance is the part that does the work.
      </p>
    </div>
  );
}
