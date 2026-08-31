"use client";

import { cn } from "@/lib/cn";
import { WhyThisWorks } from "@/components/reveal/why-this-works";
import type { ScenarioOutcome } from "@/types/scenario";

/**
 * How a branch ended.
 *
 * ---
 *
 * ## Why this stopped printing everything at once
 *
 * A copy audit of the shipped build measured the scenario outcome screen at
 * **102 to 140 words arriving in a single moment**: the closing scene lines,
 * then a headline, then a body paragraph, then three separate takeaways, each
 * a full sentence. That was the largest text wall in the product, it sat at
 * the end of REWIND, which is the mission the demo is built around, and it is
 * a fair description of what testers meant by "too much".
 *
 * The fix is not deleting takeaways. Every one of them is doing work, and a
 * prevention product that trims its own conclusions to look snappier has
 * traded the thing it exists for. The fix is the contract the rest of the
 * product already runs on:
 *
 * > **Play first. One takeaway. Detail on request.**
 *
 * So the headline, the body and the takeaway that carries the branch stay
 * visible, and the rest sit one tap away under a control that says how many
 * there are. Mayer's segmenting work is about giving the reader the pace, not
 * about giving them less; nothing here is unreachable and nothing is summarised
 * away. It is the same disclosure `ThreadPanel` and the Street Check already
 * use, which is also why this is one component rather than the two identical
 * copies it replaces.
 *
 * ## The tone colour
 *
 * `kind` tints the headline, and it is the one place in a debrief where a
 * judgement is allowed, because it describes what happened in the story rather
 * than the player who chose it. It is never the only channel: the headline and
 * the body both say it in words.
 */

const TONE: Record<ScenarioOutcome["kind"], string> = {
  good: "text-volt-300",
  mixed: "text-gold-400",
  poor: "text-coral-300",
};

export function OutcomeCard({
  outcome,
  className,
}: {
  outcome: ScenarioOutcome;
  className?: string;
}) {
  const [lead, ...rest] = outcome.takeaways;

  return (
    <div className={cn("sq-card p-5", className)}>
      <p className={cn("font-display text-xl leading-tight font-extrabold", TONE[outcome.kind])}>
        {outcome.headline}
      </p>
      <p className="mt-3 text-sm leading-relaxed text-mist">{outcome.body}</p>

      {lead ? (
        <p className="mt-5 flex gap-2.5 text-sm leading-relaxed text-chalk">
          <span
            aria-hidden
            className="mt-2 size-1.5 shrink-0 rounded-full bg-current opacity-40"
          />
          {lead}
        </p>
      ) : null}

      {rest.length > 0 ? (
        <WhyThisWorks
          className="mt-4"
          label={rest.length === 1 ? "One more thing about this" : `${rest.length} more things about this`}
        >
          <ul className="space-y-2.5">
            {rest.map((takeaway) => (
              <li key={takeaway} className="flex gap-2.5 text-sm leading-relaxed text-chalk">
                <span
                  aria-hidden
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-current opacity-40"
                />
                {takeaway}
              </li>
            ))}
          </ul>
        </WhyThisWorks>
      ) : null}
    </div>
  );
}
