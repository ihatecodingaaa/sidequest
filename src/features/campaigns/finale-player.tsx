"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight, Check, Lock, Sparkles, Zap } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button, ButtonLink } from "@/components/ui/button";
import { MissionShell } from "@/features/missions/engine/mission-shell";
import { StoryView, useSegment } from "./story-view";
import { storyBeatLabel } from "@/components/story/story-beat";
import { SidekickLine } from "./sidekick";
import { useCampaign } from "./use-campaign";
import { getSkill } from "@/data/skills";
import { chaptersRemainingForFinale, isFinaleUnlocked, isFullyCompleted } from "@/lib/campaign";
import type { AwardResult } from "@/lib/xp";
import type { Campaign } from "@/types/campaign";

type Step = "intro" | "decide" | "outcome" | "complete";

/**
 * The finale.
 *
 * Not another quiz. The four chapter themes (urgency, norms, system design and
 * peer support) each map to one answer, and the response names which of them
 * the participant reached for. Four outcomes plus one shared closing, which is
 * a small deterministic model rather than a combinatorial branch tree, and it
 * is enough to make the ending feel like it belongs to the person playing it.
 */
export function FinalePlayer({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const { ready, progress, completeFinale } = useCampaign(campaign);

  const [step, setStep] = useState<Step>("intro");
  const [chosen, setChosen] = useState<string | null>(null);
  const [award, setAward] = useState<AwardResult | null>(null);

  const campaignHref = `/campaigns/${campaign.slug}`;
  const finale = campaign.finale;
  // Above the early returns: hooks cannot live behind a conditional.
  const introBeat = useSegment(finale.intro);

  if (!ready) {
    return (
      <MissionShell title={campaign.title} exitHref={campaignHref}>
        <div className="sq-card mt-6 h-40 animate-pulse" />
      </MissionShell>
    );
  }

  /* --------------------------------------------------------------- Lock */

  if (!progress || !isFinaleUnlocked(campaign, progress)) {
    const remaining = progress ? chaptersRemainingForFinale(campaign, progress) : 3;
    return (
      <MissionShell title={campaign.title} accent="coral" exitHref={campaignHref}>
        <div className="py-12 text-center">
          <Lock aria-hidden className="mx-auto size-7 text-faint" />
          <h1 className="mt-4 font-display text-xl font-bold text-chalk">The finale is not open</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Any {campaign.minimumChaptersForFinale} of the {campaign.chapters.length} chapters
            opens it. {remaining === 1 ? "One more to go." : `${remaining} more to go.`}
          </p>
          <ButtonLink href={campaignHref} className="mt-6" variant="secondary">
            Back to the Campaign
          </ButtonLink>
        </div>
      </MissionShell>
    );
  }

  const allDone = isFullyCompleted(campaign, progress);

  const decide = (optionId: string) => {
    setChosen(optionId);
    setStep("outcome");
  };

  const finish = () => {
    if (!chosen) return;
    setAward(completeFinale(chosen));
    setStep("complete");
  };

  /* -------------------------------------------------------------- Intro */

  if (step === "intro") {
    return (
      <MissionShell
        title="Finale"
        accent="coral"
        progress={0.1}
        exitHref={campaignHref}
        footer={
          <Button
            variant="danger"
            size="lg"
            full
            onClick={() => (introBeat.complete ? setStep("decide") : introBeat.advance())}
          >
            {storyBeatLabel(introBeat, "Answer him")}
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        }
      >
        <div className="animate-rise py-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-coral-300">
            Finale
          </p>
          <h1 className="mt-2 text-balance-tight font-display text-[2.1rem] leading-[1.05] font-extrabold tracking-tight text-chalk">
            {finale.title}
          </h1>
          <StoryView segment={finale.intro} beat={introBeat} className="mt-6" />
        </div>
      </MissionShell>
    );
  }

  /* ------------------------------------------------------------- Decide */

  if (step === "decide") {
    return (
      <MissionShell title="Finale" accent="coral" progress={0.5} exitHref={campaignHref}>
        <div className="animate-rise py-2">
          <h1 className="text-balance-tight font-display text-2xl leading-tight font-extrabold text-chalk">
            {finale.question}
          </h1>
          <p className="mt-2 text-sm text-muted">
            There is more than one decent answer here. Pick the one you would actually say.
          </p>

          <div className="mt-6 space-y-2.5">
            {finale.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => decide(option.id)}
                className="sq-pressable flex min-h-14 w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-left text-[0.95rem] leading-snug font-medium text-chalk hover:border-coral-500/40 hover:bg-white/7"
              >
                <span className="flex-1">{option.label}</span>
                <ArrowRight aria-hidden className="size-4 shrink-0 text-faint" />
              </button>
            ))}
          </div>
        </div>
      </MissionShell>
    );
  }

  /* ------------------------------------------------------------ Outcome */

  if (step === "outcome" && chosen) {
    const option = finale.options.find((entry) => entry.id === chosen);
    const outcome = option ? finale.outcomes[option.theme] : null;

    return (
      <MissionShell
        title="Finale"
        accent="coral"
        progress={0.85}
        exitHref={campaignHref}
        footer={
          <Button variant="volt" size="lg" full onClick={finish}>
            Finish the Campaign
          </Button>
        }
      >
        <div className="animate-rise py-2">
          {outcome ? (
            <div className="sq-card p-5">
              <p className="font-display text-xl leading-tight font-extrabold text-coral-300">
                {outcome.headline}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-mist">{outcome.body}</p>
            </div>
          ) : null}

          <div className="animate-pop mt-6 rounded-3xl border border-quest-500/30 bg-quest-500/8 p-5">
            <p className="text-balance-tight font-display text-2xl leading-[1.15] font-extrabold tracking-tight text-chalk">
              {finale.closing.headline}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-mist">{finale.closing.body}</p>
          </div>

          {allDone ? (
            <div className="mt-5 rounded-2xl border border-volt-500/25 bg-volt-500/8 p-4">
              <p className="text-sm leading-relaxed text-mist">{finale.fullCompletionNote}</p>
            </div>
          ) : null}

          <SidekickLine mood="pleased" className="mt-6">
            That is the Campaign. There is one more piece, and it does not happen tonight.
          </SidekickLine>
        </div>
      </MissionShell>
    );
  }

  /* ----------------------------------------------------------- Complete */

  if (step === "complete" && award) {
    return (
      <MissionShell title="Finale" accent="coral" progress={1} exitHref={campaignHref}>
        <div className="animate-rise space-y-6 py-4">
          <div className="text-center">
            <span className="animate-pop mx-auto grid size-16 place-items-center rounded-3xl bg-volt-500/15">
              <Check aria-hidden className="size-8 text-volt-400" strokeWidth={3} />
            </span>
            <h1 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-chalk">
              Campaign complete
            </h1>
            <p className="mt-2 text-sm text-mist">{campaign.title}</p>

            {award.awarded ? (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-volt-500/12 px-4 py-2 font-display text-xl font-extrabold text-volt-300 tabular-nums">
                <Zap aria-hidden className="size-5" />+{award.xpGained} XP
              </p>
            ) : (
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/6 px-4 py-2 text-sm font-semibold text-muted">
                Already counted. Replays do not add XP.
              </p>
            )}

            {award.leveledUp ? (
              <p className="animate-pop mt-3 inline-flex items-center gap-1.5 rounded-full border border-quest-500/40 bg-quest-500/12 px-3 py-1.5 text-sm font-bold text-quest-300">
                <Sparkles aria-hidden className="size-4" />
                Level {award.levelAfter} reached
              </p>
            ) : null}

            {allDone && award.awarded ? (
              <p className="mt-3 text-sm text-volt-300">
                All {campaign.chapters.length} chapters, so the completion bonus is included.
              </p>
            ) : null}
          </div>

          {award.awarded ? (
            <section className="sq-card p-4">
              <h2 className="text-xs font-semibold uppercase tracking-[0.1em] text-faint">
                Added to your Safety Passport
              </h2>
              <ul className="mt-3 space-y-2.5">
                {finale.skillRewards.map((entry) => {
                  const skill = getSkill(entry.skillId);
                  if (!skill) return null;
                  return (
                    <li key={entry.skillId} className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-chalk">{skill.name}</span>
                        <span className="block text-xs text-muted">{skill.capability}</span>
                      </span>
                      <span className="shrink-0 text-sm font-bold text-coral-300 tabular-nums">
                        +{entry.points}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <section className="rounded-3xl border border-quest-500/25 bg-quest-500/8 p-4">
            <p className="font-display text-base font-bold text-chalk">This is not the end of it</p>
            <p className="mt-1.5 text-sm leading-relaxed text-mist">
              The next chapter arrives tomorrow, and another one a week after that. You do not have
              to be here for them.
            </p>
          </section>

          <div className="flex flex-col gap-2.5">
            <Button
              variant="volt"
              size="lg"
              full
              onClick={() => router.push(campaignHref)}
            >
              See what comes next
              <ArrowRight aria-hidden className="size-4" />
            </Button>
            <ButtonLink href="/you" variant="secondary" size="lg" full>
              Your Safety Passport
            </ButtonLink>
          </div>
        </div>
      </MissionShell>
    );
  }

  return null;
}

/** Shared classname helper kept local to avoid leaking finale styling. */
export const finaleAccent = cn("text-coral-300");
