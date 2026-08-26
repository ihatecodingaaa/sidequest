"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Footprints, Lock, ScanLine } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_TEXT } from "@/lib/accent";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip, ProvenanceTag } from "@/components/ui/primitives";
import { MissionShell } from "@/features/missions/engine/mission-shell";
import { RewindPlayer } from "@/features/missions/rewind/rewind-player";
import { NormMirrorPlayer } from "@/features/missions/norm-mirror/norm-mirror-player";
import { BreaksafePlayer } from "@/features/missions/breaksafe/breaksafe-player";
import { CrewShiftPlayer } from "./crew-shift/crew-shift-player";
import { StoryView } from "./story-view";
import { SidekickLine } from "./sidekick";
import { ChapterComplete } from "./chapter-complete";
import { useCampaign } from "./use-campaign";
import { chapterAsMission } from "./chapter-mission";
import { getCampaignNormQuestions, getCampaignScenario } from "@/data/campaigns";
import { getCrewShiftRound } from "@/data/campaigns/crew-shift";
import { useProfile } from "@/hooks/use-profile";
import type { MissionHost } from "@/features/missions/engine/mission-host";
import type { AwardResult } from "@/lib/xp";
import type { Campaign, CampaignChapter, ChapterResult } from "@/types/campaign";

type Phase = "unlock" | "intro" | "play" | "outro" | "complete";

/**
 * Runs one Campaign chapter.
 *
 * The entry phase is the whole Scan and Scatter idea: a QR lands here, the
 * chapter unlocks immediately, and the first thing on screen tells the
 * participant to walk away from the station. Everything after that happens
 * wherever they end up standing, which is how a hall of eighty people stops
 * being one queue.
 */
export function ChapterRunner({
  campaign,
  chapter,
}: {
  campaign: Campaign;
  chapter: CampaignChapter;
}) {
  const router = useRouter();
  const { ready } = useProfile();
  const { progress, ensureStarted, unlock, completeChapter } = useCampaign(campaign);

  const [phase, setPhase] = useState<Phase>("unlock");
  const [award, setAward] = useState<AwardResult | null>(null);
  const [outcome, setOutcome] = useState<ChapterResult>({ mechanic: chapter.config.mechanic } as ChapterResult);

  const mode = progress?.mode ?? "story";
  const alreadyDone = Boolean(progress?.completedChapterIds.includes(chapter.id));
  const campaignHref = `/campaigns/${campaign.slug}`;

  // A scan is an unlock. This runs once, on arrival, whether the participant
  // came from a QR, a station code or the map.
  useEffect(() => {
    if (!ready) return;
    ensureStarted();
    unlock(chapter.id);
  }, [ready, ensureStarted, unlock, chapter.id]);

  const host: MissionHost = {
    exitHref: campaignHref,
    complete: () => {
      const result = completeChapter(chapter.id, outcome);
      setAward(result);
      return result;
    },
    renderComplete: (result) => (
      <ChapterComplete
        campaign={campaign}
        chapter={chapter}
        result={result}
        onContinue={() => {
          if (mode === "story" && chapter.outro) setPhase("outro");
          else router.push(campaignHref);
        }}
      />
    ),
  };

  /* ------------------------------------------------------------- Unlock */

  if (phase === "unlock") {
    return (
      <MissionShell
        title={campaign.title}
        accent={chapter.accent}
        exitHref={campaignHref}
        footer={
          <Button
            variant="volt"
            size="lg"
            full
            onClick={() => setPhase(mode === "story" && chapter.intro ? "intro" : "play")}
          >
            Start chapter {chapter.chapterNumber}
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        }
      >
        <div className="animate-rise py-4">
          <div className="flex flex-wrap items-center gap-1.5">
            <Chip accent={chapter.accent}>Chapter {chapter.chapterNumber}</Chip>
            <ProvenanceTag provenance={campaign.provenance} compact />
          </div>

          <p className="animate-pop mt-6 inline-flex items-center gap-2 rounded-full bg-volt-500/15 px-4 py-2 font-display text-sm font-extrabold uppercase tracking-[0.1em] text-volt-300">
            <Check aria-hidden className="size-4" strokeWidth={3} />
            Chapter unlocked
          </p>

          <h1 className="mt-4 text-balance-tight font-display text-[2.1rem] leading-[1.05] font-extrabold tracking-tight text-chalk">
            {chapter.title}
          </h1>
          <p className="mt-2 text-base leading-relaxed text-mist">{chapter.shortDescription}</p>

          {/* The congestion instruction. This is the point of the screen. */}
          <div className="mt-7 flex gap-3.5 rounded-3xl border border-volt-500/25 bg-volt-500/8 p-4">
            <Footprints aria-hidden className="mt-0.5 size-6 shrink-0 text-volt-300" />
            <div>
              <h2 className="font-display text-lg leading-tight font-bold text-chalk">
                Move away from the station
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-mist">
                It is saved to your phone now. Find somewhere to stand and play it there, so the
                next person can scan.
              </p>
            </div>
          </div>

          <p className="mt-5 text-sm text-muted">{chapter.brief}</p>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-faint">
            <span>About {chapter.estimatedMinutes} min</span>
            <span aria-hidden>&middot;</span>
            <span className={ACCENT_TEXT[chapter.accent]}>{chapter.xp} XP</span>
            {alreadyDone ? (
              <>
                <span aria-hidden>&middot;</span>
                <span className="text-volt-300">Already completed, replay is free</span>
              </>
            ) : null}
          </div>

          <Link
            href={campaignHref}
            className="mt-6 inline-flex min-h-11 items-center text-sm font-semibold text-quest-300 hover:text-quest-400"
          >
            See the whole Campaign first
          </Link>
        </div>
      </MissionShell>
    );
  }

  /* -------------------------------------------------------------- Intro */

  if (phase === "intro" && chapter.intro) {
    return (
      <MissionShell
        title={chapter.title}
        accent={chapter.accent}
        progress={0.1}
        exitHref={campaignHref}
        footer={
          <Button variant="volt" size="lg" full onClick={() => setPhase("play")}>
            Continue
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        }
      >
        <div className="animate-rise py-2">
          <StoryView segment={chapter.intro} />
          <SidekickLine mood="thinking" className="mt-7">
            {chapter.brief}
          </SidekickLine>
        </div>
      </MissionShell>
    );
  }

  /* --------------------------------------------------------------- Play */

  if (phase === "play") {
    return (
      <ChapterMechanic
        campaign={campaign}
        chapter={chapter}
        host={host}
        onOutcome={setOutcome}
      />
    );
  }

  /* -------------------------------------------------------------- Outro */

  if (phase === "outro" && chapter.outro) {
    return (
      <MissionShell
        title={chapter.title}
        accent={chapter.accent}
        progress={1}
        exitHref={campaignHref}
        footer={
          <ButtonLink href={campaignHref} variant="volt" size="lg" full>
            Back to the Campaign
            <ArrowRight aria-hidden className="size-4" />
          </ButtonLink>
        }
      >
        <div className="animate-rise py-2">
          <StoryView segment={chapter.outro} />
          {award?.awarded ? (
            <p className="mt-7 inline-flex items-center gap-2 rounded-full bg-volt-500/12 px-3.5 py-1.5 text-sm font-bold text-volt-300">
              +{award.xpGained} XP added
            </p>
          ) : null}
        </div>
      </MissionShell>
    );
  }

  return null;
}

/* ------------------------------------------------------- Mechanic dispatch */

/**
 * Mounts the mechanic a chapter is configured for.
 *
 * Everything except Crew Shift is an existing SIDEQUEST player, driven through
 * the `MissionHost` seam with Campaign content passed in. None of their logic
 * is reimplemented here.
 */
function ChapterMechanic({
  campaign,
  chapter,
  host,
  onOutcome,
}: {
  campaign: Campaign;
  chapter: CampaignChapter;
  host: MissionHost;
  onOutcome: (result: ChapterResult) => void;
}) {
  const mission = chapterAsMission(campaign, chapter);
  const config = chapter.config;

  switch (config.mechanic) {
    case "rewind": {
      const scenario = getCampaignScenario(config.scenarioId);
      if (!scenario) return <MissingContent host={host} />;
      return (
        <RewindPlayer
          mission={mission}
          scenario={scenario}
          host={host}
          onResult={(result) => onOutcome({ mechanic: "rewind", ...result })}
        />
      );
    }

    case "norm-mirror": {
      const questions = getCampaignNormQuestions(config.questionSetId);
      if (!questions) return <MissingContent host={host} />;
      return (
        <NormMirrorPlayer
          mission={mission}
          questions={questions}
          host={host}
          onResult={(result) => onOutcome({ mechanic: "norm-mirror", ...result })}
        />
      );
    }

    case "breaksafe":
      return (
        <BreaksafePlayer
          mission={mission}
          host={host}
          onResult={(result) => onOutcome({ mechanic: "breaksafe", ...result })}
        />
      );

    case "crew-shift": {
      const round = getCrewShiftRound(config.roundId);
      if (!round) return <MissingContent host={host} />;
      return (
        <CrewShiftPlayer
          round={round}
          accent={chapter.accent}
          host={host}
          onResult={(result) => onOutcome({ mechanic: "crew-shift", ...result })}
        />
      );
    }

    default:
      return <MissingContent host={host} />;
  }
}

function MissingContent({ host }: { host: MissionHost }) {
  return (
    <MissionShell title="Chapter" exitHref={host.exitHref}>
      <div className="py-12 text-center">
        <Lock aria-hidden className="mx-auto size-7 text-faint" />
        <p className="mt-4 font-display text-lg font-bold text-chalk">
          This chapter is not available
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          Its content is missing. The rest of the Campaign still works, and three of four chapters
          is enough to reach the finale.
        </p>
        <ButtonLink href={host.exitHref} className="mt-6" variant="secondary">
          Back to the Campaign
        </ButtonLink>
      </div>
    </MissionShell>
  );
}

/** Small marker used by the station sign copy and the map legend. */
export function ScanBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-white/6 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-mist",
        className,
      )}
    >
      <ScanLine aria-hidden className="size-3" />
      Scan to unlock
    </span>
  );
}
