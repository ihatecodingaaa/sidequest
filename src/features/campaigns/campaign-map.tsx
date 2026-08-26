"use client";

import Link from "next/link";
import { Check, Lock, Play, Flag } from "lucide-react";

import { cn } from "@/lib/cn";
import { EchoMascot } from "@/components/echo/echo-mascot";
import { resolveEchoStyle } from "@/data/echo-styles";
import { useProfile } from "@/hooks/use-profile";
import type { Campaign, CampaignChapter, CampaignProgress } from "@/types/campaign";

/**
 * The Campaign map.
 *
 * What this replaces: a vertical list of four full width cards threaded onto a
 * spine. Every state was modelled properly and the audit still called it a task
 * manager, which was fair. A single column reads top to bottom whatever is
 * drawn down the left of it, and ONE BAD MINUTE is not a sequence. Any three of
 * the four stations open the finale, different participants are handed
 * different recommended routes, and a busy station is meant to be skipped
 * rather than waited for. A list argues against all of that.
 *
 * So the four chapters no longer connect to each other. They sit as a
 * constellation and each one connects only upward, to the finale. That single
 * change is what stops the layout implying an order: there is no edge between
 * chapter one and chapter two to read as "then". What the shape says instead is
 * four ways in, one destination, which is exactly the rule.
 *
 * Geometry is percentage based inside one stretched SVG rather than measured in
 * JavaScript. No resize observer, no layout thrash, and the connectors stay
 * attached at any width because they are anchored to the same fractions the
 * grid uses. `vectorEffect` keeps the stroke honest while the viewBox is
 * distorted.
 *
 * What this deliberately does not do:
 *
 * - It does not know where anybody is standing. Nothing here reads a sensor,
 *   and "scan at the station" is a statement about this device's own state,
 *   not about a person's location.
 * - It does not claim to know that a station is busy. That stays the
 *   participant's judgement, and the map's job is only to make the alternative
 *   visibly available at the moment it is needed.
 * - It carries no legend. If a node needed a key to be understood the node
 *   would be the thing to fix.
 */

export type MapNodeState = "done" | "current" | "available" | "locked";

const STATE_WORD: Record<MapNodeState, string> = {
  done: "Done",
  current: "Up next",
  available: "Open",
  locked: "Scan at the station",
};

/**
 * Connector endpoints, as percentages of the map box.
 *
 * These stop in the gap above the grid rather than reaching each tile centre.
 * The first version ran a line from the finale to the middle of every node,
 * which on a two by two grid meant both lower connectors were drawn straight
 * through the upper tiles: text with a stroke across it, and worse, an
 * apparent edge between one chapter and another, which is the exact reading
 * this layout exists to prevent.
 *
 * A fan of four short spokes says the same true thing (four of these feed one
 * destination) and crosses nothing.
 */
const POINTS = [
  { x: 18, y: 26 },
  { x: 39, y: 27 },
  { x: 61, y: 27 },
  { x: 82, y: 26 },
];

const FINALE_ANCHOR = { x: 50, y: 8 };

export function CampaignMap({
  campaign,
  progress,
  chapters,
  nextChapter,
  finaleReady,
  remaining,
  className,
}: {
  campaign: Campaign;
  progress: CampaignProgress;
  /** Physical chapters, in the participant's own route order. */
  chapters: CampaignChapter[];
  nextChapter: CampaignChapter | null;
  finaleReady: boolean;
  /** Chapters still needed before the finale opens. */
  remaining: number;
  className?: string;
}) {
  const { profile, ready } = useProfile();
  const echoStyle = resolveEchoStyle(profile);
  const done = chapters.filter((chapter) =>
    progress.completedChapterIds.includes(chapter.id),
  ).length;
  const allDone = done === chapters.length;

  /*
   * Once the finale is open it becomes the recommended thing, and the primary
   * control above the map says so. Leaving a chapter tile also labelled "Up
   * next" put two different answers to the same question on one screen. Any
   * chapter still outstanding at that point is genuinely optional, so it reads
   * as open rather than as the next step, and Echo moves to the destination it
   * is now pointing at.
   */
  const currentId = finaleReady ? null : (nextChapter?.id ?? null);

  const stateOf = (chapter: CampaignChapter): MapNodeState => {
    if (progress.completedChapterIds.includes(chapter.id)) return "done";
    if (currentId === chapter.id) return "current";
    if (progress.unlockedChapterIds.includes(chapter.id)) return "available";
    return "locked";
  };

  const echoMark =
    ready && !progress.finaleCompleted ? (
      <EchoMascot
        style={echoStyle.id}
        expression={finaleReady ? "pleased" : "neutral"}
        size={30}
        className={echoStyle.ring}
      />
    ) : null;

  return (
    <div className={cn("relative mx-auto w-full max-w-md", className)}>
      {/*
        Connectors. Decorative: every relationship they draw is also stated in
        the accessible name of the node they touch.
      */}
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 size-full"
      >
        {POINTS.slice(0, chapters.length).map((point, index) => {
          const chapter = chapters[index];
          const reached = progress.completedChapterIds.includes(chapter.id);
          return (
            <line
              key={chapter.id}
              x1={FINALE_ANCHOR.x}
              y1={FINALE_ANCHOR.y}
              x2={point.x}
              y2={point.y}
              vectorEffect="non-scaling-stroke"
              strokeWidth={reached ? 2 : 1.5}
              strokeLinecap="round"
              strokeDasharray={reached ? undefined : "3 5"}
              className={reached ? "stroke-volt-500/45" : "stroke-white/12"}
            />
          );
        })}
      </svg>

      <div className="relative">
        {/* The destination, at the top, where a destination belongs. */}
        <FinaleNode
          slug={campaign.slug}
          ready={finaleReady}
          completed={progress.finaleCompleted}
          remaining={remaining}
          allDone={allDone}
          echo={finaleReady ? echoMark : null}
        />

        <ul className="mt-5 grid grid-cols-2 gap-2.5">
          {chapters.map((chapter, index) => {
            const state = stateOf(chapter);
            return (
              <li key={chapter.id}>
                <ChapterTile
                  campaignSlug={campaign.slug}
                  chapter={chapter}
                  state={state}
                  index={index + 1}
                  echo={state === "current" ? echoMark : null}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Tile */

function ChapterTile({
  campaignSlug,
  chapter,
  state,
  index,
  echo,
}: {
  campaignSlug: string;
  chapter: CampaignChapter;
  state: MapNodeState;
  index: number;
  echo: React.ReactNode;
}) {
  /*
   * The accessible name carries the same three facts the tile shows: which
   * chapter, which station, and what can be done about it now. Somebody using
   * a screen reader gets the map without the geometry.
   */
  const label = [
    chapter.title,
    chapter.stationCode ? `Station ${chapter.stationCode}` : null,
    STATE_WORD[state].toLowerCase(),
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={`/campaigns/${campaignSlug}/chapter/${chapter.slug}`}
      aria-label={label}
      data-node-state={state}
      className={cn(
        "sq-pressable relative flex min-h-[8.5rem] flex-col rounded-2xl border p-3 transition-colors",
        state === "current" && "border-quest-500/50 bg-quest-500/10",
        state === "done" && "border-volt-500/25 bg-volt-500/[0.06]",
        state === "available" && "border-white/12 bg-white/[0.03] hover:border-white/20",
        state === "locked" && "border-dashed border-white/14 bg-transparent",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        {/*
          Shape, icon and colour together. Any one of the three is enough, so
          the state survives a colour vision difference or a dark room.
        */}
        <span
          aria-hidden
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-full",
            state === "done" && "bg-volt-500 text-ink-900",
            state === "current" && "bg-quest-500 text-white ring-2 ring-quest-300/45",
            state === "available" && "bg-white/10 text-mist",
            state === "locked" && "border border-dashed border-white/25 text-faint",
          )}
        >
          {state === "done" ? (
            <Check aria-hidden className="size-4" strokeWidth={3} />
          ) : state === "current" ? (
            <Play aria-hidden className="size-3" fill="currentColor" />
          ) : state === "locked" ? (
            <Lock aria-hidden className="size-3" />
          ) : (
            <span className="text-[0.65rem] font-bold">{index}</span>
          )}
        </span>

        {/* Station identity belongs to the node, not to a metadata row. */}
        {chapter.stationCode ? (
          <span
            aria-hidden
            className="rounded-md bg-white/6 px-1.5 py-0.5 font-mono text-[0.65rem] font-bold text-mist"
          >
            {chapter.stationCode}
          </span>
        ) : null}
      </span>

      <span
        className={cn(
          "mt-2 block font-display text-sm leading-tight font-bold",
          state === "locked" ? "text-mist" : "text-chalk",
        )}
      >
        {chapter.title}
      </span>

      <span
        aria-hidden
        className={cn(
          "mt-auto block pt-2 text-[0.7rem] font-semibold",
          state === "current" && "text-quest-300",
          state === "done" && "text-volt-300",
          state === "available" && "text-mist",
          state === "locked" && "text-faint",
        )}
      >
        {STATE_WORD[state]}
      </span>

      {echo ? (
        <span aria-hidden className="absolute -top-3 -right-2">
          {echo}
        </span>
      ) : null}
    </Link>
  );
}

/* ---------------------------------------------------------------- Finale */

function FinaleNode({
  slug,
  ready,
  completed,
  remaining,
  allDone,
  echo,
}: {
  slug: string;
  ready: boolean;
  completed: boolean;
  remaining: number;
  allDone: boolean;
  echo: React.ReactNode;
}) {
  /*
   * Locked, the finale still shows what it is and how far away it is, because
   * an aspirational destination that says nothing is just a greyed row. The
   * count is the shortest true sentence available: one more, or two more.
   */
  const status = completed
    ? "Finished"
    : ready
      ? allDone
        ? "Full route complete"
        : "Ready"
      : `${remaining} more ${remaining === 1 ? "chapter" : "chapters"}`;

  const body = (
    <>
      <span
        aria-hidden
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-xl",
          ready ? "bg-volt-500 text-ink-900" : "border border-dashed border-white/20 text-faint",
        )}
      >
        {ready ? <Flag aria-hidden className="size-4.5" /> : <Lock aria-hidden className="size-4" />}
      </span>
      <span className="min-w-0">
        <span className="block font-display text-base leading-tight font-extrabold text-chalk">
          The finale
        </span>
        <span
          className={cn(
            "mt-0.5 block text-xs font-semibold",
            ready ? "text-volt-300" : "text-faint",
          )}
        >
          {status}
        </span>
      </span>
    </>
  );

  const marker = echo ? (
    <span aria-hidden className="absolute -top-3 -right-2">
      {echo}
    </span>
  ) : null;

  const shell = cn(
    "relative z-10 mx-auto flex w-[86%] items-center gap-3 rounded-2xl border px-4 py-3",
    ready
      ? "border-volt-500/45 bg-volt-500/10 shadow-[0_0_30px_-12px_rgba(180,255,61,0.6)]"
      : "border-dashed border-white/14 bg-ink-900/60",
  );

  if (!ready) {
    return (
      <div className={shell} aria-label={`The finale, locked. ${status} needed.`} role="group">
        {body}
        {marker}
      </div>
    );
  }

  return (
    <Link
      href={`/campaigns/${slug}/finale`}
      aria-label={`The finale, ${status.toLowerCase()}`}
      className={cn(shell, "sq-pressable")}
    >
      {body}
      {marker}
    </Link>
  );
}
