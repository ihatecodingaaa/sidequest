"use client";

import { useState } from "react";
import { ArrowRight, ArrowLeft, Check, Lock, Zap } from "lucide-react";

import { Button, ButtonLink } from "@/components/ui/button";
import { MissionShell } from "@/features/missions/engine/mission-shell";
import { StoryView } from "./story-view";
import { SidekickLine } from "./sidekick";
import { useCampaign } from "./use-campaign";
import { getStoryBeat } from "@/data/campaigns/story-beats";
import { isFollowUpUnlocked } from "@/lib/campaign";
import { useMounted } from "@/hooks/use-profile";
import type { AwardResult } from "@/lib/xp";
import type { Campaign, CampaignFollowUp } from "@/types/campaign";

type Step = "intro" | "decide" | "response" | "complete";

/**
 * A follow-up chapter.
 *
 * Ninety seconds, one situation, one decision. Short on purpose: this is played
 * a day or a week after the event by somebody who has half forgotten the story,
 * and the job is retrieval, not new teaching.
 */
export function FollowUpPlayer({
  campaign,
  followUp,
}: {
  campaign: Campaign;
  followUp: CampaignFollowUp;
}) {
  const { ready, progress, completeFollowUp } = useCampaign(campaign);
  const mounted = useMounted();

  const [step, setStep] = useState<Step>("intro");
  const [chosen, setChosen] = useState<string | null>(null);
  const [award, setAward] = useState<AwardResult | null>(null);

  const campaignHref = `/campaigns/${campaign.slug}`;
  const beat = followUp.config.mechanic === "story" ? getStoryBeat(followUp.config.storyId) : undefined;

  if (!ready || !mounted) {
    return (
      <MissionShell title={followUp.title} exitHref={campaignHref}>
        <div className="sq-card mt-6 h-40 animate-pulse" />
      </MissionShell>
    );
  }

  if (!progress || !isFollowUpUnlocked(progress, followUp) || !beat) {
    return (
      <MissionShell title={followUp.title} accent={followUp.accent} exitHref={campaignHref}>
        <div className="py-12 text-center">
          <Lock aria-hidden className="mx-auto size-7 text-faint" />
          <h1 className="mt-4 font-display text-xl font-bold text-chalk">Not open yet</h1>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            This one arrives after the Campaign, on its own. Nothing to do until then.
          </p>
          <ButtonLink href={campaignHref} className="mt-6" variant="secondary">
            <ArrowLeft aria-hidden className="size-4" />
            Back to the Campaign
          </ButtonLink>
        </div>
      </MissionShell>
    );
  }

  const finish = () => {
    setAward(completeFollowUp(followUp));
    setStep("complete");
  };

  if (step === "intro") {
    return (
      <MissionShell
        title={followUp.title}
        accent={followUp.accent}
        progress={0.15}
        exitHref={campaignHref}
        footer={
          <Button variant="volt" size="lg" full onClick={() => setStep("decide")}>
            Continue
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        }
      >
        <div className="animate-rise py-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">Follow-up</p>
          <h1 className="mt-2 font-display text-3xl leading-tight font-extrabold tracking-tight text-chalk">
            {followUp.title}
          </h1>
          <StoryView segment={beat.setup} className="mt-6" />
        </div>
      </MissionShell>
    );
  }

  if (step === "decide") {
    return (
      <MissionShell
        title={followUp.title}
        accent={followUp.accent}
        progress={0.5}
        exitHref={campaignHref}
      >
        <div className="animate-rise py-2">
          <h1 className="text-balance-tight font-display text-2xl leading-tight font-extrabold text-chalk">
            {beat.question}
          </h1>
          <div className="mt-6 space-y-2.5">
            {beat.options.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setChosen(option.id);
                  setStep("response");
                }}
                className="sq-pressable flex min-h-14 w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-left text-[0.95rem] leading-snug font-medium text-chalk hover:border-quest-500/40 hover:bg-white/7"
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

  if (step === "response" && chosen) {
    const option = beat.options.find((entry) => entry.id === chosen);

    return (
      <MissionShell
        title={followUp.title}
        accent={followUp.accent}
        progress={0.85}
        exitHref={campaignHref}
        footer={
          <Button variant="volt" size="lg" full onClick={finish}>
            Finish
          </Button>
        }
      >
        <div className="animate-rise py-2">
          {option ? (
            <div className="sq-card p-5">
              <p className="font-display text-xl leading-tight font-extrabold text-chalk">
                {option.response.headline}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-mist">{option.response.body}</p>
            </div>
          ) : null}
          <SidekickLine mood="thinking" className="mt-6">
            {beat.closing}
          </SidekickLine>
        </div>
      </MissionShell>
    );
  }

  if (step === "complete" && award) {
    return (
      <MissionShell
        title={followUp.title}
        accent={followUp.accent}
        progress={1}
        exitHref={campaignHref}
      >
        <div className="animate-rise py-6 text-center">
          <span className="animate-pop mx-auto grid size-16 place-items-center rounded-3xl bg-volt-500/15">
            <Check aria-hidden className="size-8 text-volt-400" strokeWidth={3} />
          </span>
          <h1 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-chalk">
            Follow-up complete
          </h1>

          {award.awarded ? (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-volt-500/12 px-4 py-2 font-display text-lg font-extrabold text-volt-300 tabular-nums">
              <Zap aria-hidden className="size-5" />+{award.xpGained} XP
            </p>
          ) : (
            <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/6 px-4 py-2 text-sm font-semibold text-muted">
              Already counted.
            </p>
          )}

          <p className="mx-auto mt-5 max-w-sm text-sm leading-relaxed text-mist">
            {followUp.behaviouralMechanism}
          </p>

          <ButtonLink href={campaignHref} className="mt-7" variant="volt" size="lg" full>
            Back to the Campaign
          </ButtonLink>
        </div>
      </MissionShell>
    );
  }

  return null;
}
