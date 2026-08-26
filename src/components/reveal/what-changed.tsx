import { resolveProtectiveFactors } from "@/data/protective-factors";
import type { ProtectiveFactorId } from "@/types/protective";

/**
 * "What changed the outcome?"
 *
 * One to three factors, resolved deterministically from the path the player
 * actually took. Not a lesson page: no mechanism jargon, no scoring, no
 * paragraph of theory. If the list is empty the whole section disappears
 * rather than rendering an empty heading.
 *
 * The heading is a question because the answer belongs to the story that just
 * happened, and a question invites the player to check it against what they
 * saw rather than accept it as instruction.
 */
export function WhatChanged({
  factorIds,
  heading = "What changed the outcome?",
}: {
  factorIds: readonly ProtectiveFactorId[] | undefined;
  heading?: string;
}) {
  const factors = resolveProtectiveFactors(factorIds);
  if (factors.length === 0) return null;

  return (
    <section className="mt-7">
      <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-faint">{heading}</h2>
      <ul className="mt-3 space-y-3.5">
        {factors.map((factor) => (
          <li key={factor.id} className="border-l-2 border-volt-500/40 pl-3.5">
            <p className="text-sm font-bold leading-snug text-chalk">{factor.label}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted">{factor.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
