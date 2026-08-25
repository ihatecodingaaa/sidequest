"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Sparkles, Zap } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_TEXT } from "@/lib/accent";
import { formatXp } from "@/lib/format";
import { getSkill } from "@/data/skills";
import { getPulseItem } from "@/data/pulse";
import { QUICK_LINKS } from "@/lib/official-links";
import { Button, ButtonLink } from "@/components/ui/button";
import { ExternalLink } from "@/components/ui/primitives";
import { usePrefersReducedMotion } from "@/hooks/use-profile";
import type { Mission } from "@/types/mission";
import type { AwardResult } from "@/lib/xp";

/**
 * Completion screen.
 *
 * Reads the award result rather than recomputing it, so a replayed mission
 * honestly shows "already counted" instead of pretending to grant XP again.
 */
export function MissionComplete({
  mission,
  result,
  /** Optional extra line summarising what the player specifically did. */
  summary,
}: {
  mission: Mission;
  result: AwardResult;
  summary?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const [countedXp, setCountedXp] = useState(0);
  const animates = !reduced && result.xpGained > 0;

  // When motion is reduced there is nothing to animate, so the final figure is
  // derived rather than stored. That keeps every setState inside a frame
  // callback instead of the effect body.
  const shownXp = animates ? countedXp : result.xpGained;

  useEffect(() => {
    if (!animates) return;

    // Short count-up. Long enough to register, short enough not to be a wait.
    const duration = 750;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCountedXp(Math.round(result.xpGained * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animates, result.xpGained]);

  const relatedPulse = mission.relatedPulseItemIds?.[0]
    ? getPulseItem(mission.relatedPulseItemIds[0])
    : undefined;

  const showScamShield = mission.categories.includes("scams") || mission.categories.includes("cyber");

  return (
    <div className="animate-rise space-y-6 py-4">
      <div className="text-center">
        <span
          className={cn(
            "animate-pop mx-auto grid size-16 place-items-center rounded-3xl bg-volt-500/15",
          )}
        >
          <Check aria-hidden className="size-8 text-volt-400" strokeWidth={3} />
        </span>

        <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-chalk">
          Mission complete
        </h1>
        {summary ? <p className="mt-2 text-sm text-mist">{summary}</p> : null}

        {result.awarded ? (
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-volt-500/12 px-4 py-2 font-display text-xl font-extrabold text-volt-300 tabular-nums">
            <Zap aria-hidden className="size-5" />+{formatXp(shownXp)} XP
          </p>
        ) : (
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/6 px-4 py-2 text-sm font-semibold text-muted">
            Already counted. Replays do not add XP.
          </p>
        )}

        {result.leveledUp ? (
          <p className="animate-pop mt-3 inline-flex items-center gap-1.5 rounded-full border border-quest-500/40 bg-quest-500/12 px-3 py-1.5 text-sm font-bold text-quest-300">
            <Sparkles aria-hidden className="size-4" />
            Level {result.levelAfter} reached
          </p>
        ) : null}
      </div>

      {/* Capability, not points. */}
      {result.awarded && mission.skillRewards.length ? (
        <section className="sq-card p-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-faint">
            Added to your Safety Passport
          </h2>
          <ul className="mt-3 space-y-2.5">
            {mission.skillRewards.map((award) => {
              const skill = getSkill(award.skillId);
              if (!skill) return null;
              return (
                <li key={award.skillId} className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-chalk">{skill.name}</span>
                    <span className="block text-xs text-muted">{skill.capability}</span>
                  </span>
                  <span className={cn("shrink-0 text-sm font-bold tabular-nums", ACCENT_TEXT[mission.accent])}>
                    +{award.points}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      {/* Information to action, in the other direction. */}
      <section className="space-y-2.5">
        {showScamShield ? (
          <ExternalLink
            href={QUICK_LINKS.scamShield}
            className="sq-card sq-pressable flex items-center gap-3 p-4 hover:border-white/16"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-chalk">Set up ScamShield</span>
              <span className="block text-xs text-muted">
                Blocks scam calls and messages. Official national service.
              </span>
            </span>
          </ExternalLink>
        ) : null}

        {relatedPulse ? (
          <Link
            href={`/pulse/${relatedPulse.id}`}
            className="sq-card sq-pressable flex items-center gap-3 p-4 hover:border-white/16"
          >
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-bold text-chalk">{relatedPulse.title}</span>
              <span className="block text-xs text-muted">Read the background in Pulse</span>
            </span>
            <ArrowRight aria-hidden className="size-4 shrink-0 text-faint" />
          </Link>
        ) : null}
      </section>

      <div className="flex flex-col gap-2.5 pt-1">
        <ButtonLink href="/missions" size="lg" full>
          Next mission
          <ArrowRight aria-hidden className="size-4" />
        </ButtonLink>
        <ButtonLink href="/you" size="lg" variant="secondary" full>
          See your Safety Passport
        </ButtonLink>
      </div>
    </div>
  );
}

/** Small replay control shared by the players. */
export function ReplayButton({ onReplay }: { onReplay: () => void }) {
  return (
    <Button variant="ghost" size="sm" onClick={onReplay} className="text-muted">
      Play again
    </Button>
  );
}
