"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Check, Footprints, Lock, ScanLine } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_TEXT } from "@/lib/accent";
import { Button, ButtonLink } from "@/components/ui/button";
import { MissionShell } from "@/features/missions/engine/mission-shell";
import { RewindPlayer } from "@/features/missions/rewind/rewind-player";
import { NormMirrorPlayer } from "@/features/missions/norm-mirror/norm-mirror-player";
import { BreaksafePlayer } from "@/features/missions/breaksafe/breaksafe-player";
import { CrewShiftPlayer } from "./crew-shift/crew-shift-player";
import { StoryView, useSegment } from "./story-view";
import { storyBeatLabel } from "@/components/story/story-beat";
import { CharacterPortrait } from "@/components/story/character-portrait";
import { MissionWorld } from "@/components/mission/mission-world";
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

/** Stand-in for a chapter with no intro or outro, so the hooks stay unconditional. */
const EMPTY_SEGMENT = { lines: [] as string[] };

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

  /*
   * Above every early return: hooks cannot live behind a conditional. Both
   * segments are prepared even though only one renders, which costs nothing
   * because a beat is a counter over an array the fixture already holds.
   */
  const introBeat = useSegment(chapter.intro ?? EMPTY_SEGMENT);
  const outroBeat = useSegment(chapter.outro ?? EMPTY_SEGMENT);

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
        {/*
          This screen was the heaviest reading load in the whole chapter, which
          was a surprise: the tap audit found its worst step was here rather
          than in any story beat. It carried a chapter chip, a provenance tag,
          an unlock badge, a title, a description, a boxed congestion
          instruction, the brief, and a metadata row, all above the fold.

          It now says three things: it worked, what this chapter is, and move
          away from the station. The brief belongs to the story that is about to
          start, so it moved there. The provenance tag moved to the Campaign
          screen, which is where the Campaign is described and where the rule
          about declaring once per screen is satisfied.
        */}
        <div className="animate-rise py-4">
          <p className="animate-pop inline-flex items-center gap-2 rounded-full bg-volt-500/15 px-4 py-2 font-display text-sm font-extrabold uppercase tracking-[0.1em] text-volt-300">
            <Check aria-hidden className="size-4" strokeWidth={3} />
            Chapter {chapter.chapterNumber} unlocked
          </p>

          <h1 className="mt-5 text-balance-tight font-display text-[2.1rem] leading-[1.05] font-extrabold tracking-tight text-chalk">
            {chapter.title}
          </h1>

          <p className="mt-6 flex items-center gap-2.5 text-sm font-semibold text-volt-300">
            <Footprints aria-hidden className="size-5 shrink-0" />
            Move away from the station, then play.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs font-semibold text-faint">
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

          {/*
            The scene, as a picture rather than a paragraph.

            Stripping this screen back was the right call and the tap audit
            backs it: it used to be the heaviest reading step in the chapter.
            What the reduction left behind was roughly 750px of empty black
            between the last line of text and the footer, which does not read
            as restraint on a phone. It reads as a screen that failed to load.

            So the space gets filled with the one thing that costs no reading:
            who is in this, and when it happens. Four faces and a timestamp
            establish the chapter as a scene with people in it before a single
            story line has been shown, and the whole band is decorative, so
            assistive technology still hears the same short screen it did
            before.
          */}
          {/*
            Crew Shift opens on its mechanic rather than on the cast.

            Every other chapter is a scene four people are standing in, so four
            portraits and a timestamp are the right establishing shot. Crew
            Shift is not about who is present, it is about a room moving after
            it talks, and that is a thing a group photo cannot show. Its world
            draws four figures of equal weight with scattered arrows becoming
            aligned ones, and marks none of them as the reason the others
            moved, which is the same rule the mission itself follows.
          */}
          {chapter.config.mechanic === "crew-shift" ? (
            <div className="mt-10">
              <MissionWorld art="crew-shift" accent={chapter.accent} scale="intro" />
              {chapter.intro?.slug ? (
                <p className="mt-4 text-center text-[0.7rem] font-bold uppercase tracking-[0.18em] text-faint">
                  {chapter.intro.slug}
                </p>
              ) : null}
            </div>
          ) : chapter.intro?.slug ? (
            <div className="mt-10">
              <div className="relative overflow-hidden rounded-3xl border border-white/8 bg-white/[0.03] px-5 py-10">
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[radial-gradient(120%_120%_at_50%_0%,rgba(255,255,255,0.06)_0%,transparent_62%)]"
                />
                <div aria-hidden className="relative flex items-end justify-center">
                  {(["you", "rina", "ilyas", "ken"] as const).map((id, index) => (
                    <CharacterPortrait
                      key={id}
                      characterId={id}
                      expression={index === 3 ? "uncertain" : "neutral"}
                      className={cn(
                        "size-[4.5rem] -ml-3.5 first:ml-0 drop-shadow-[0_6px_14px_rgba(0,0,0,0.45)]",
                        index === 3 && "size-24",
                      )}
                    />
                  ))}
                </div>
                <p className="relative mt-5 text-center text-[0.7rem] font-bold uppercase tracking-[0.18em] text-faint">
                  {chapter.intro.slug}
                </p>
              </div>
            </div>
          ) : null}
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
          <Button
            variant="volt"
            size="lg"
            full
            onClick={() => (introBeat.complete ? setPhase("play") : introBeat.advance())}
          >
            {/* One word throughout: the intro flows straight into the chapter. */}
            {storyBeatLabel(introBeat, "Continue")}
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        }
      >
        <div className="animate-rise py-2">
          <StoryView segment={chapter.intro} beat={introBeat} />
          {/* Echo waits until the scene has finished rather than talking over it. */}
          {introBeat.complete ? (
            <SidekickLine mood="thinking" className="mt-7">
              {chapter.brief}
            </SidekickLine>
          ) : null}
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
          /*
            One control, two jobs: it plays the scene out, and only once the
            scene is finished does it become the way back. A link here would
            have let the closing beat be skipped without meaning to.
          */
          outroBeat.complete ? (
            <ButtonLink href={campaignHref} variant="volt" size="lg" full>
              Back to the Campaign
              <ArrowRight aria-hidden className="size-4" />
            </ButtonLink>
          ) : (
            <Button variant="volt" size="lg" full onClick={outroBeat.advance}>
              Continue
              <ArrowRight aria-hidden className="size-4" />
            </Button>
          )
        }
      >
        <div className="animate-rise py-2">
          <StoryView segment={chapter.outro} beat={outroBeat} />
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
