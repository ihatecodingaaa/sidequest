import { cn } from "@/lib/cn";
import { type Accent } from "@/lib/accent";
import { type MissionArtId } from "@/components/mission/mission-art";

/**
 * Mission worlds.
 *
 * The marks in `mission-art.tsx` do their job, which is recognition at
 * thumbnail size. They were then asked to do a second job they were never
 * drawn for: telling a user what kind of experience a mission is before the
 * body copy is read. A 48 unit diagram inside a 64px rounded square cannot
 * carry that, and the audit was blunt about it. Eleven dark rectangles with a
 * small line drawing in the corner is a list, not a set of places to go.
 *
 * So the marks stay at small scale and this is the layer above them: a wide
 * scene per signature mission, sized for a card banner or a mission intro.
 *
 * The rule from the earlier passes still holds. An image with no job competes
 * with the text beside it, so every one of these states its job:
 *
 *   rewind       one moment, a marked pivot, and two futures leaving it, one
 *                of them folding back. Choice, consequence, second attempt.
 *   norm-mirror  a large imagined crowd against a small measured one, across a
 *                distorted mirror line. The gap is the mission.
 *   breaksafe    the same figure, at the same coordinates, twice. Only the
 *                environment around it is rearranged.
 *   crew-shift   four equal figures, scattered arrows becoming aligned ones.
 *                The movement belongs to the group.
 *
 * Deliberate constraints:
 *
 * - No face is drawn at this scale. These are silhouettes, so nobody in them
 *   is identifiable, and nothing here can read as profiling a person.
 * - BREAKSAFE keeps its figure identical on both sides. The environment is the
 *   variable. If a future edit makes the person change, the mission's whole
 *   argument has been inverted.
 * - CREW SHIFT gives all four figures the same weight and never marks one as
 *   the source of the shift.
 * - NORM MIRROR draws no numbers and no axis. It is a shape comparison, not a
 *   statistic, because the underlying aggregates are prototype data and the
 *   screen says so in text.
 *
 * All decorative: every use sits beside the mission title in real text.
 */

export type MissionWorldScale = "card" | "intro";

const SCALE: Record<MissionWorldScale, string> = {
  card: "h-24 sm:h-28",
  intro: "h-40 sm:h-48",
};

/** Accent-tinted ground. Literal strings: Tailwind scans source text. */
const GROUND: Record<Accent, string> = {
  quest: "bg-quest-500/10 text-quest-300",
  pulse: "bg-pulse-500/10 text-pulse-300",
  volt: "bg-volt-500/10 text-volt-300",
  coral: "bg-coral-500/10 text-coral-300",
  gold: "bg-gold-500/10 text-gold-400",
};

export function MissionWorld({
  art,
  accent,
  scale = "card",
  className,
}: {
  art: MissionArtId;
  accent: Accent;
  scale?: MissionWorldScale;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      /*
       * The scenes are decorative, so there is no accessible name to assert
       * against and a test cannot tell REWIND's drawing from BREAKSAFE's. This
       * attribute exists purely so the suite can prove each mission renders its
       * own world and no other, which is the failure mode that would otherwise
       * ship silently: the art is wrong, every test still passes, and nobody
       * notices until a judge does.
       */
      data-mission-world={art}
      className={cn(
        "relative block w-full overflow-hidden rounded-2xl",
        GROUND[accent],
        SCALE[scale],
        className,
      )}
    >
      {/*
        `meet`, not `slice`. Cropping to fill looked better in the abstract and
        was wrong in practice: at card height it cut the top off the Norm
        Mirror thought outline and sliced both floor lines, so the one
        comparison the drawing exists to make lost the baseline it was being
        measured against. Every scene is composed inside 320x120 with its own
        margin, and is now guaranteed to arrive whole at any height.
      */}
      <svg
        viewBox="0 0 320 120"
        preserveAspectRatio="xMidYMid meet"
        className="size-full text-current"
      >
        <Scene art={art} />
      </svg>
    </span>
  );
}

/* ------------------------------------------------------------- Vocabulary */

/** A standing figure. One shape, so a crowd of them stays cheap. */
function Figure({
  x,
  y,
  s = 1,
  opacity = 1,
}: {
  x: number;
  y: number;
  s?: number;
  opacity?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <circle cx="0" cy="-16" r="6.4" fill="currentColor" />
      <path
        d="M0 -8c6.6 0 11.4 4.8 12.2 11.4L13 12H-13l0.8-8.6C-11.4 -3.2 -6.6 -8 0 -8Z"
        fill="currentColor"
      />
    </g>
  );
}

const LINE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Scene({ art }: { art: MissionArtId }) {
  if (art === "rewind") return <RewindScene />;
  if (art === "norm-mirror") return <NormMirrorScene />;
  if (art === "breaksafe") return <BreaksafeScene />;
  if (art === "crew-shift") return <CrewShiftScene />;
  return <CampaignScene />;
}

/* ---------------------------------------------------------------- REWIND */

/**
 * A group at a moment, a pivot, and two futures. The upper future runs on and
 * ends in a figure standing apart from the others. The lower one folds back
 * under it and returns to the pivot, which is the mechanic: you get the moment
 * again. The pivot is the only filled ring in the drawing, because it is the
 * only place in the mission where anything is decided.
 */
function RewindScene() {
  return (
    <g>
      <Figure x={52} y={92} s={1.05} opacity={0.85} />
      <Figure x={80} y={96} s={0.9} opacity={0.55} />
      <Figure x={30} y={98} s={0.82} opacity={0.4} />

      {/* The pivot */}
      <circle cx="132" cy="70" r="9.5" fill="currentColor" />
      <circle cx="132" cy="70" r="17" {...LINE} opacity="0.45" />

      {/* Future one: it keeps going */}
      <path d="M146 63c26-16 48-18 74-18" {...LINE} />
      <path d="M212 38l10 7-10 7" {...LINE} />
      <Figure x={252} y={64} s={0.9} opacity={0.9} />

      {/* Future two: it folds back to the pivot */}
      <path
        d="M144 79c24 16 52 20 74 6"
        {...LINE}
        strokeDasharray="7 7"
        opacity="0.75"
      />
      <path d="M228 79l-10 6 1-12" {...LINE} opacity="0.75" />
    </g>
  );
}

/* ----------------------------------------------------------- NORM MIRROR */

/**
 * Left: what you picture, drawn as a crowd that runs off the edge of the
 * frame, inside a soft thought outline. Right: what the group in front of you
 * actually reported, drawn as a handful. The divider is deliberately not
 * straight. A clean mirror would say "these are two equal measurements"; a
 * bent one says the reflection is the thing that is wrong.
 */
function NormMirrorScene() {
  const imagined = [
    [26, 92, 0.9],
    [52, 88, 1],
    [78, 93, 0.86],
    [40, 70, 0.72],
    [66, 68, 0.66],
    [14, 72, 0.6],
    [90, 72, 0.58],
  ] as const;

  return (
    <g>
      {/* What you picture */}
      <path
        d="M8 38c0-13 16-21 44-21s52 8 52 21-6 25-6 38H14c0-13-6-25-6-38Z"
        {...LINE}
        strokeWidth={1.8}
        opacity="0.28"
      />
      {imagined.map(([x, y, s], i) => (
        <Figure key={i} x={x} y={y} s={s} opacity={0.5} />
      ))}

      {/* The bent mirror */}
      <path d="M160 8c-10 30 12 56-2 104" {...LINE} strokeWidth={2.8} opacity="0.85" />

      {/* What was actually reported */}
      <Figure x={214} y={92} s={0.95} opacity={0.95} />
      <Figure x={248} y={94} s={0.8} opacity={0.6} />

      {/* The floor both sides stand on, so the size gap is readable */}
      <path d="M12 106h124" {...LINE} strokeWidth={1.6} opacity="0.3" />
      <path d="M186 106h122" {...LINE} strokeWidth={1.6} opacity="0.3" />
    </g>
  );
}

/* ------------------------------------------------------------- BREAKSAFE */

/**
 * The same figure, at the same offset inside each half, twice. Left: the
 * environment is loose, and one element is tilted out of line with a friction
 * marker on it. Right: the identical pieces are squared into a frame and the
 * marker has become a check. Nothing about the person changed, which is the
 * entire claim the mission makes.
 */
function BreaksafeScene() {
  const block = { fill: "currentColor", opacity: 0.3 } as const;

  return (
    <g>
      {/* Before */}
      <g>
        <rect x="18" y="30" width="34" height="22" rx="5" {...block} />
        <rect
          x="60"
          y="26"
          width="34"
          height="22"
          rx="5"
          {...block}
          transform="rotate(-11 77 37)"
        />
        <rect x="24" y="60" width="70" height="10" rx="5" {...block} opacity="0.18" />
        <circle cx="94" cy="24" r="8" {...LINE} strokeWidth={2} opacity="0.9" />
        <path d="M94 20v5" {...LINE} strokeWidth={2} />
        <circle cx="94" cy="28.6" r="1.3" fill="currentColor" />
        <Figure x={58} y={104} s={1} opacity={0.95} />
      </g>

      {/* The divider */}
      <path d="M160 12v98" {...LINE} strokeWidth={1.6} strokeDasharray="5 8" opacity="0.35" />

      {/* After: same pieces, squared up */}
      <g>
        <rect x="186" y="30" width="34" height="22" rx="5" {...block} />
        <rect x="228" y="30" width="34" height="22" rx="5" {...block} />
        <rect x="186" y="60" width="76" height="10" rx="5" {...block} opacity="0.18" />
        <path d="M258 22l5 5 9-10" {...LINE} strokeWidth={2.6} />
        <Figure x={226} y={104} s={1} opacity={0.95} />
      </g>
    </g>
  );
}

/* ------------------------------------------------------------ CREW SHIFT */

/**
 * Four figures at equal weight around one shared point. Each has a faint arrow
 * pointing somewhere different and a solid one pointing at the centre. No
 * figure is larger, brighter, first, or marked as the reason the others moved,
 * because the mission is about what a room does, not about who in it is a
 * problem.
 */
function CrewShiftScene() {
  const seats = [
    { x: 74, y: 44, stray: "M86 34l16-11", aim: "M88 42l38 12" },
    { x: 74, y: 104, stray: "M86 106l18 10", aim: "M88 98l38 -18" },
    { x: 246, y: 44, stray: "M234 34l-16-11", aim: "M232 42l-38 12" },
    { x: 246, y: 104, stray: "M234 106l-18 10", aim: "M232 98l-38 -18" },
  ];

  return (
    <g>
      {/* The shared thing they are deciding */}
      <circle cx="160" cy="72" r="20" {...LINE} opacity="0.5" />
      <circle cx="160" cy="72" r="7.5" fill="currentColor" />

      {seats.map((seat, i) => (
        <g key={i}>
          <path d={seat.stray} {...LINE} strokeWidth={1.8} strokeDasharray="4 6" opacity="0.35" />
          <path d={seat.aim} {...LINE} strokeWidth={2.2} opacity="0.8" />
          <Figure x={seat.x} y={seat.y} s={0.86} opacity={0.9} />
        </g>
      ))}
    </g>
  );
}

/* -------------------------------------------------------------- CAMPAIGN */

/** Four stations on a route, one lit, and a destination past the last of them. */
function CampaignScene() {
  return (
    <g>
      <path d="M30 92c40-38 76 22 116-16s70 10 104-22" {...LINE} strokeWidth={2} opacity="0.4" />
      {[
        [30, 92, 1],
        [104, 72, 0.55],
        [188, 72, 0.55],
        [250, 56, 0.55],
      ].map(([x, y, o], i) => (
        <circle key={i} cx={x} cy={y} r={i === 0 ? 10 : 7} fill="currentColor" opacity={o} />
      ))}
      <path d="M292 42l8 8-8 8-8-8Z" fill="currentColor" opacity="0.9" />
    </g>
  );
}
