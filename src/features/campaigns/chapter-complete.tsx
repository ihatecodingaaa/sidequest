"use client";

import { ArrowRight, Check, Flag, Zap } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_TEXT } from "@/lib/accent";
import { Button } from "@/components/ui/button";
import { getSkill } from "@/data/skills";
import { chaptersRemainingForFinale, isFinaleUnlocked } from "@/lib/campaign";
import { useCampaign } from "./use-campaign";
import { SidekickLine } from "./sidekick";
import type { AwardResult } from "@/lib/xp";
import type { Campaign, CampaignChapter } from "@/types/campaign";

/**
 * Chapter completion, inside a Campaign.
 *
 * Different from the standalone mission completion on purpose: it points back
 * into the Campaign rather than out to the mission catalogue, and it tells the
 * participant exactly how close the finale is. At a roadshow that number is
 * the thing that decides whether somebody walks to another station.
 */
export function ChapterComplete({
  campaign,
  chapter,
  result,
  onContinue,
}: {
  campaign: Campaign;
  chapter: CampaignChapter;
  result: AwardResult;
  onContinue: () => void;
}) {
  const { progress } = useCampaign(campaign);

  const finaleReady = progress ? isFinaleUnlocked(campaign, progress) : false;
  const remaining = progress ? chaptersRemainingForFinale(campaign, progress) : 3;

  return (
    <div className="animate-rise space-y-6 py-4">
      <div className="text-center">
        <span className="animate-pop mx-auto grid size-16 place-items-center rounded-3xl bg-volt-500/15">
          <Check aria-hidden className="size-8 text-volt-400" strokeWidth={3} />
        </span>

        <h1 className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-faint">
          Chapter {chapter.chapterNumber} complete
        </h1>
        <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-chalk">
          {chapter.title}
        </p>

        {result.awarded ? (
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-volt-500/12 px-4 py-2 font-display text-xl font-extrabold text-volt-300 tabular-nums">
            <Zap aria-hidden className="size-5" />+{result.xpGained} XP
          </p>
        ) : (
          <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/6 px-4 py-2 text-sm font-semibold text-muted">
            Already counted. Replays do not add XP.
          </p>
        )}
      </div>

      {/* The number that decides whether somebody walks to another station. */}
      <section
        className={cn(
          "rounded-3xl border p-4",
          finaleReady ? "border-volt-500/30 bg-volt-500/8" : "border-white/10 bg-white/4",
        )}
      >
        <div className="flex items-start gap-3">
          <Flag
            aria-hidden
            className={cn("mt-0.5 size-5 shrink-0", finaleReady ? "text-volt-300" : "text-faint")}
          />
          <div>
            <p className="font-display text-base font-bold text-chalk">
              {finaleReady
                ? "The finale is open"
                : remaining === 1
                  ? "One more chapter opens the finale"
                  : `${remaining} more chapters open the finale`}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-mist">
              {finaleReady
                ? "You can finish now, or clear the last station for the full picture and a bonus."
                : "Any three of the four. If a station is busy or broken, go to a different one."}
            </p>
          </div>
        </div>
      </section>

      {result.awarded && chapter.skillRewards.length ? (
        <section className="sq-card p-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-faint">
            Added to your Safety Passport
          </h2>
          <ul className="mt-3 space-y-2.5">
            {chapter.skillRewards.map((award) => {
              const skill = getSkill(award.skillId);
              if (!skill) return null;
              return (
                <li key={award.skillId} className="flex items-start justify-between gap-3">
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-chalk">{skill.name}</span>
                    <span className="block text-xs text-muted">{skill.capability}</span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-bold tabular-nums",
                      ACCENT_TEXT[chapter.accent],
                    )}
                  >
                    +{award.points}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <SidekickLine mood="pleased">{chapter.behaviouralObjective}</SidekickLine>

      <Button variant="volt" size="lg" full onClick={onContinue}>
        Continue
        <ArrowRight aria-hidden className="size-4" />
      </Button>
    </div>
  );
}
