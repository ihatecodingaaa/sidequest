"use client";

import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

import type { CrewChallenge } from "@/data/crew-challenges";
import type { ContinueItem } from "@/features/home/continue-state";

/**
 * Where you were.
 *
 * ---
 *
 * ## Why this is the first thing a returning player sees
 *
 * Because for them the question is not "what is this product" but "where was
 * I", and every previous version of Home answered the first question to
 * somebody who had stopped asking it.
 *
 * ## One thing, not four
 *
 * The item is chosen by strict priority in `continue-state.ts`: a half-read
 * campaign chapter beats a half-finished thread beats somebody standing in the
 * district. A card offering all three would be a menu, and the entire value of
 * a continue control is not having to choose.
 *
 * The crew line and the open loop are secondary and both are omitted when they
 * are empty. They are text and a quiet link, never a second primary button,
 * because two primary controls means one of them is losing.
 *
 * ## What is deliberately absent
 *
 * No streak, no day count, no "you were last here", no countdown, no urgency,
 * no unread badge and nothing that expires. Every line is true whenever it is
 * read, which is what makes it safe to show without a clock the product does
 * not have.
 */
export function ContinueCard({
  item,
  crew,
  loop,
}: {
  item: ContinueItem;
  crew: CrewChallenge | null;
  loop: string | null;
}) {
  return (
    <section
      aria-labelledby="carry-on"
      className="rounded-[1.5rem] border border-quest-500/25 bg-quest-500/6 p-5"
    >
      <p
        id="carry-on"
        className="text-[0.7rem] font-bold tracking-[0.16em] text-quest-300 uppercase"
      >
        Where you were
      </p>

      <h2 className="mt-1.5 font-display text-[1.35rem] leading-tight font-extrabold text-chalk">
        {item.title}
      </h2>
      <p className="mt-1 text-sm text-mist">{item.detail}</p>

      <Link
        href={item.href}
        className="sq-pressable mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-quest-500 px-5 text-sm font-bold text-white hover:bg-quest-400"
      >
        {item.cta}
        <ArrowRight aria-hidden className="size-4" />
      </Link>

      {crew ? (
        <Link
          href="/crew"
          className="sq-pressable mt-4 flex min-h-11 items-center gap-2 text-sm text-mist hover:text-chalk"
        >
          <Users aria-hidden className="size-4 shrink-0 text-faint" />
          <span className="min-w-0 flex-1 truncate">
            Your crew: {crew.title.toLowerCase()}
          </span>
          <ArrowRight aria-hidden className="size-4 shrink-0 text-faint" />
        </Link>
      ) : null}

      {loop ? <p className="mt-2 text-xs leading-relaxed text-faint">{loop}</p> : null}
    </section>
  );
}
