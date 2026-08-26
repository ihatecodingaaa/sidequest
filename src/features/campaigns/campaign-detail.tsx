"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  Flag,
  KeyRound,
  Lock,
  MapPin,
  QrCode,
  Rocket,
  Zap,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_BG_SOFT, ACCENT_TEXT } from "@/lib/accent";
import { Button } from "@/components/ui/button";
import { Chip, ProgressBar, ProvenanceTag } from "@/components/ui/primitives";
import { PageHeader } from "@/components/layout/app-shell";
import { useCampaign } from "./use-campaign";
import { SidekickLine } from "./sidekick";
import { FollowUpList } from "./follow-up-list";
import { CampaignDemoControls } from "./campaign-demo-controls";
import {
  campaignFraction,
  chaptersRemainingForFinale,
  completedPhysicalCount,
  findChapterByStationCode,
  getRoute,
  isFinaleUnlocked,
  isFullyCompleted,
  nextRecommendedChapter,
  physicalChapters,
} from "@/lib/campaign";
import type { Campaign, CampaignMode } from "@/types/campaign";

export function CampaignDetail({ campaign }: { campaign: Campaign }) {
  const { ready, progress, ensureStarted, changeMode } = useCampaign(campaign);

  if (!ready) return <CampaignSkeleton campaign={campaign} />;
  if (!progress) return <CampaignStart campaign={campaign} onStart={ensureStarted} />;

  const route = getRoute(campaign, progress.routeId);
  const stations = physicalChapters(campaign);
  const done = completedPhysicalCount(campaign, progress);
  const finaleReady = isFinaleUnlocked(campaign, progress);
  const allDone = isFullyCompleted(campaign, progress);
  const remaining = chaptersRemainingForFinale(campaign, progress);
  const next = nextRecommendedChapter(campaign, progress);

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Campaign"
        title={campaign.title}
        lede={campaign.description}
      />

      <div className="flex flex-wrap items-center gap-1.5">
        <Chip accent={campaign.accent}>{campaign.locationType}</Chip>
        <ProvenanceTag provenance={campaign.provenance} compact />
        <span className="text-xs font-semibold text-faint">
          About {campaign.estimatedMinutes} min
        </span>
      </div>

      {/* Progress */}
      <section className="sq-card p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-faint">
              {route.label}
            </p>
            <p className="mt-0.5 font-display text-xl font-extrabold text-chalk">
              {done} of {stations.length} chapters
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide",
              progress.mode === "story"
                ? "bg-quest-500/15 text-quest-300"
                : "bg-volt-500/15 text-volt-300",
            )}
          >
            {progress.mode === "story" ? "Story mode" : "Quick mode"}
          </span>
        </div>

        <ProgressBar
          className="mt-4"
          accent={campaign.accent}
          value={campaignFraction(campaign, progress)}
          label="Campaign progress"
        />

        <p className="mt-2.5 text-sm text-muted">
          {progress.finaleCompleted
            ? "Campaign complete."
            : finaleReady
              ? "The finale is open."
              : remaining === 1
                ? "One more chapter opens the finale."
                : `${remaining} more chapters open the finale.`}
        </p>

        <button
          type="button"
          onClick={() => changeMode(progress.mode === "story" ? "quick" : "story")}
          className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-quest-300 hover:text-quest-400"
        >
          {progress.mode === "story" ? "Switch to Quick mode" : "Switch to Story mode"}
        </button>
      </section>

      {next && !progress.finaleCompleted ? (
        <SidekickLine mood="thinking">
          Next on {route.label}: {next.title}. If that station is busy, take any other one. Three of
          four is enough.
        </SidekickLine>
      ) : null}

      {/* The map */}
      <section aria-labelledby="chapters">
        <h2 id="chapters" className="mb-3 text-lg font-bold tracking-tight text-chalk">
          Chapters
        </h2>

        <ol className="relative space-y-2.5 pl-7">
          <span
            aria-hidden
            className="absolute top-3 bottom-10 left-[0.6875rem] w-px bg-white/10"
          />
          {route.orderedChapterIds.map((chapterId, index) => {
            const chapter = campaign.chapters.find((entry) => entry.id === chapterId);
            if (!chapter) return null;

            const complete = progress.completedChapterIds.includes(chapter.id);
            const unlocked = progress.unlockedChapterIds.includes(chapter.id);
            const isNext = next?.id === chapter.id;

            return (
              <li key={chapter.id} className="relative">
                <span
                  aria-hidden
                  className={cn(
                    "absolute top-5 -left-7 grid size-6 place-items-center rounded-full border-2 border-ink-900",
                    complete
                      ? "bg-volt-500 text-ink-900"
                      : isNext
                        ? cn(ACCENT_BG_SOFT[chapter.accent], "ring-2", "ring-white/20")
                        : "bg-ink-700",
                  )}
                >
                  {complete ? (
                    <Check aria-hidden className="size-3.5" strokeWidth={3} />
                  ) : (
                    <span className="text-[0.6rem] font-bold text-mist">{index + 1}</span>
                  )}
                </span>

                <Link
                  href={`/campaigns/${campaign.slug}/chapter/${chapter.slug}`}
                  className={cn(
                    "sq-card sq-pressable block p-4 hover:border-white/16",
                    complete && "opacity-80",
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-base leading-tight font-bold text-chalk">
                        {chapter.title}
                      </p>
                      <p className="mt-0.5 text-sm leading-snug text-muted">
                        {chapter.shortDescription}
                      </p>
                    </div>
                    {chapter.stationCode ? (
                      <span className="shrink-0 rounded-lg bg-white/6 px-2 py-1 font-mono text-xs font-bold text-mist">
                        {chapter.stationCode}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2.5 flex items-center gap-3 text-xs font-semibold text-faint">
                    <span>{chapter.estimatedMinutes} min</span>
                    <span className={ACCENT_TEXT[chapter.accent]}>{chapter.xp} XP</span>
                    {complete ? (
                      <span className="text-volt-300">Done</span>
                    ) : unlocked ? (
                      <span className="text-quest-300">Unlocked</span>
                    ) : (
                      <span>Scan at the station</span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}

          {/* Finale */}
          <li className="relative pt-1">
            <span
              aria-hidden
              className={cn(
                "absolute top-6 -left-7 grid size-6 place-items-center rounded-full border-2 border-ink-900",
                progress.finaleCompleted
                  ? "bg-volt-500 text-ink-900"
                  : finaleReady
                    ? "bg-coral-500 text-ink-900"
                    : "bg-ink-700",
              )}
            >
              {progress.finaleCompleted ? (
                <Check aria-hidden className="size-3.5" strokeWidth={3} />
              ) : finaleReady ? (
                <Flag aria-hidden className="size-3" />
              ) : (
                <Lock aria-hidden className="size-3 text-faint" />
              )}
            </span>

            {finaleReady ? (
              <Link
                href={`/campaigns/${campaign.slug}/finale`}
                className="sq-card sq-pressable block border-coral-500/30 bg-coral-500/8 p-4"
              >
                <p className="font-display text-base font-bold text-chalk">
                  {progress.finaleCompleted ? "Finale, replay" : "Finale"}
                </p>
                <p className="mt-0.5 text-sm text-mist">
                  {progress.finaleCompleted
                    ? "You have finished this Campaign."
                    : "How it ends is one decision."}
                </p>
                <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-coral-300">
                  <Zap aria-hidden className="size-3.5" />
                  {campaign.finale.xp} XP
                  {!allDone ? null : ` plus ${campaign.fullCompletionBonusXp} bonus`}
                </span>
              </Link>
            ) : (
              <div className="sq-card p-4 opacity-70">
                <p className="font-display text-base font-bold text-chalk">Finale</p>
                <p className="mt-0.5 text-sm text-muted">
                  Opens after any {campaign.minimumChaptersForFinale} chapters.
                </p>
              </div>
            )}
          </li>
        </ol>
      </section>

      <StationCodeEntry campaign={campaign} />

      <FollowUpList campaign={campaign} />

      {/*
        Organiser and evaluator tools. Quiet links rather than two full-width
        buttons: a participant never needs either of these, and giving them
        button weight put event logistics on the same footing as the story.
      */}
      <section className="flex flex-wrap items-center gap-x-5 gap-y-1">
        <Link
          href={`/campaigns/${campaign.slug}/stations`}
          className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-mist hover:text-chalk"
        >
          <QrCode aria-hidden className="size-4 text-faint" />
          Station signs
        </Link>
        <Link
          href={`/campaigns/${campaign.slug}/impact`}
          className="inline-flex min-h-11 items-center text-sm font-semibold text-mist hover:text-chalk"
        >
          What a pilot could measure
        </Link>
      </section>

      <CampaignDemoControls campaign={campaign} />
    </div>
  );
}

/* --------------------------------------------------------- Station codes */

/**
 * The fallback that makes QR safe to depend on.
 *
 * A printed code that a facilitator can read out loud covers a torn sign, a
 * camera that will not focus, a cracked screen and a browser without camera
 * permission. It is on the Campaign screen permanently, not hidden behind an
 * error state, because by the time somebody hits an error they have already
 * given up.
 */
function StationCodeEntry({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = () => {
    const chapter = findChapterByStationCode(campaign, code);
    if (!chapter) {
      setError("No station with that code. Check the sign, or ask whoever is running it.");
      return;
    }
    router.push(`/campaigns/${campaign.slug}/chapter/${chapter.slug}`);
  };

  return (
    <section className="sq-card p-4">
      <label className="block">
        <span className="flex items-center gap-2 text-sm font-semibold text-chalk">
          <KeyRound aria-hidden className="size-4 text-faint" />
          Cannot scan? Enter the station code
        </span>
        <input
          value={code}
          onChange={(event) => {
            setCode(event.target.value.toUpperCase().slice(0, 6));
            setError(null);
          }}
          placeholder="A7"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          className="mt-2 h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 font-mono text-base tracking-[0.2em] text-chalk uppercase placeholder:tracking-normal placeholder:text-faint focus:border-quest-400 focus:outline-none"
        />
      </label>

      {error ? (
        <p role="alert" className="mt-2 text-sm text-coral-300">
          {error}
        </p>
      ) : null}

      <Button
        className="mt-3"
        full
        disabled={code.trim().length === 0}
        onClick={submit}
      >
        Unlock chapter
      </Button>
    </section>
  );
}

/* ---------------------------------------------------------------- Start */

function CampaignStart({
  campaign,
  onStart,
}: {
  campaign: Campaign;
  onStart: (mode: CampaignMode) => void;
}) {
  const [mode, setMode] = useState<CampaignMode>("story");

  return (
    <div>
      <PageHeader eyebrow="Campaign" title={campaign.title} lede={campaign.description} />

      <div className="mb-6 flex flex-wrap items-center gap-1.5">
        <Chip accent={campaign.accent}>{campaign.locationType}</Chip>
        <ProvenanceTag provenance={campaign.provenance} compact />
        <span className="text-xs font-semibold text-faint">
          About {campaign.estimatedMinutes} min
        </span>
      </div>

      <SidekickLine mood="neutral" className="mb-7">
        {campaign.premise} Pick how you want to play it. You can change this later.
      </SidekickLine>

      <fieldset>
        <legend className="sr-only">Choose a mode</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <ModeCard
            selected={mode === "story"}
            onSelect={() => setMode("story")}
            icon={<BookOpen aria-hidden className="size-5" />}
            title="Story mode"
            body="The full narrative between chapters. About eighteen minutes."
          />
          <ModeCard
            selected={mode === "quick"}
            onSelect={() => setMode("quick")}
            icon={<Rocket aria-hidden className="size-5" />}
            title="Quick mode"
            body="Straight to each challenge. Same chapters, same XP, less reading."
          />
        </div>
      </fieldset>

      <p className="mt-4 text-sm text-muted">
        Both count the same. Quick mode skips the story beats, not the thinking.
      </p>

      <Button
        variant="volt"
        size="lg"
        full
        className="mt-7"
        onClick={() => onStart(mode)}
      >
        Start the Campaign
        <ArrowRight aria-hidden className="size-4" />
      </Button>

      <div className="sq-card mt-6 flex gap-3 p-4">
        <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-volt-300" />
        <p className="text-sm leading-relaxed text-mist">
          Built for a physical event. Four stations, each with a printed QR code. You scan, walk
          away, and play on your phone. Any three of the four opens the finale.
        </p>
      </div>
    </div>
  );
}

function ModeCard({
  selected,
  onSelect,
  icon,
  title,
  body,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "sq-pressable flex h-full w-full items-start gap-3 rounded-2xl border p-4 text-left",
        selected
          ? "border-quest-400 bg-quest-500/12"
          : "border-white/10 bg-white/4 hover:bg-white/7",
      )}
    >
      <span
        className={cn(
          "grid size-10 shrink-0 place-items-center rounded-xl",
          selected ? "bg-quest-500/20 text-quest-300" : "bg-white/6 text-faint",
        )}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-display text-base font-bold text-chalk">{title}</span>
        <span className="mt-0.5 block text-sm leading-snug text-muted">{body}</span>
      </span>
      {selected ? <Check aria-hidden className="size-5 shrink-0 text-quest-300" /> : null}
    </button>
  );
}

function CampaignSkeleton({ campaign }: { campaign: Campaign }) {
  return (
    <div>
      <PageHeader eyebrow="Campaign" title={campaign.title} lede={campaign.description} />
      <div className="sq-card h-40 animate-pulse" />
    </div>
  );
}
