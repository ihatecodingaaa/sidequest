import { cn } from "@/lib/cn";
import { type Accent } from "@/lib/accent";

/**
 * Mission marks.
 *
 * The testers called Missions dull, and the cards were: eleven rows of the same
 * shape, distinguished by a word. But "add pictures" is the wrong reading of
 * that. The coherence principle says an image with no job competes with the
 * text beside it, so the job here is stated and narrow: **make a mission
 * recognisable at a glance, before it is read.**
 *
 * Each mark is one abstract diagram of what the mission actually does, drawn
 * from the same geometric vocabulary as the SIDEQUEST logo. They are not
 * illustrations of scenes and they are not decoration:
 *
 *   rewind      two paths from one point, one of them turning back
 *   norm-mirror two bars at very different heights, which is the whole mission
 *   breaksafe   a grid with one cell changed
 *   crew-shift  four dots that move
 *   campaign    four linked nodes, one lit
 *
 * Inline SVG, so they cost no request and no layout shift, and they scale
 * without an asset pipeline. Nothing here is licensed from anywhere.
 *
 * All are `aria-hidden`. Every one sits next to the mission's title in text,
 * so announcing them would only repeat it.
 */
export type MissionArtId = "rewind" | "norm-mirror" | "breaksafe" | "crew-shift" | "campaign";

const STROKE = {
  fill: "none",
  strokeWidth: 2.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function MissionArt({
  art,
  accent,
  className,
}: {
  art: MissionArtId;
  accent: Accent;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative grid place-items-center overflow-hidden rounded-2xl",
        FIELD[accent],
        className,
      )}
    >
      <svg viewBox="0 0 48 48" className="size-3/5 text-current">
        <Glyph art={art} />
      </svg>
    </span>
  );
}

/** A quiet colour field per accent, so the mark reads as a surface not an icon. */
const FIELD: Record<Accent, string> = {
  quest: "bg-quest-500/12 text-quest-300",
  pulse: "bg-pulse-500/12 text-pulse-300",
  volt: "bg-volt-500/12 text-volt-300",
  coral: "bg-coral-500/12 text-coral-300",
  gold: "bg-gold-500/12 text-gold-400",
};

function Glyph({ art }: { art: MissionArtId }) {
  if (art === "rewind") {
    /* One decision point, two futures, and the way back to it. */
    return (
      <g stroke="currentColor" {...STROKE}>
        <circle cx="16" cy="30" r="3.2" fill="currentColor" stroke="none" />
        <path d="M16 27V16h16" />
        <path d="M27 11l5 5-5 5" />
        <path d="M16 33c0 6 5 8 11 8" opacity="0.45" />
      </g>
    );
  }

  if (art === "norm-mirror") {
    /* The gap between what you think people do and what the figure says. */
    return (
      <g stroke="currentColor" {...STROKE}>
        <path d="M15 40V14" />
        <path d="M33 40V27" opacity="0.5" />
        <path d="M9 40h30" opacity="0.35" />
        <circle cx="15" cy="14" r="2.6" fill="currentColor" stroke="none" />
        <circle cx="33" cy="27" r="2.6" fill="currentColor" stroke="none" opacity="0.5" />
      </g>
    );
  }

  if (art === "breaksafe") {
    /* A system, with one part deliberately changed. */
    return (
      <g stroke="currentColor" {...STROKE}>
        <rect x="9" y="9" width="13" height="13" rx="3" opacity="0.4" />
        <rect x="26" y="9" width="13" height="13" rx="3" opacity="0.4" />
        <rect x="9" y="26" width="13" height="13" rx="3" opacity="0.4" />
        <rect x="26" y="26" width="13" height="13" rx="3" fill="currentColor" stroke="none" />
        <path d="M29.5 32.5l2.6 2.6 4.4-4.6" stroke="var(--color-ink-900)" strokeWidth="2.4" />
      </g>
    );
  }

  if (art === "crew-shift") {
    /* Four people, and the fact that they moved. */
    return (
      <g stroke="currentColor" {...STROKE}>
        <circle cx="13" cy="15" r="3" fill="currentColor" stroke="none" opacity="0.45" />
        <circle cx="13" cy="33" r="3" fill="currentColor" stroke="none" opacity="0.45" />
        <circle cx="35" cy="15" r="3" fill="currentColor" stroke="none" />
        <circle cx="35" cy="33" r="3" fill="currentColor" stroke="none" />
        <path d="M18 15h11" opacity="0.5" />
        <path d="M18 33h11" opacity="0.5" />
        <path d="M26 20l4 4-4 4" opacity="0.7" />
      </g>
    );
  }

  /* Campaign: four linked chapters, the current one lit. */
  return (
    <g stroke="currentColor" {...STROKE}>
      <path d="M12 12v24" opacity="0.35" />
      <circle cx="12" cy="12" r="3.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="24" r="3.4" fill="currentColor" stroke="none" opacity="0.4" />
      <circle cx="12" cy="36" r="3.4" fill="currentColor" stroke="none" opacity="0.4" />
      <path d="M19 12h18" opacity="0.5" />
      <path d="M19 24h12" opacity="0.28" />
      <path d="M19 36h14" opacity="0.28" />
    </g>
  );
}

/** Which mark a mission uses. Missions with no mark simply do not get one. */
export const MISSION_ART: Record<string, MissionArtId> = {
  "mission-rewind": "rewind",
  "mission-norm-mirror": "norm-mirror",
  "mission-breaksafe": "breaksafe",
};
