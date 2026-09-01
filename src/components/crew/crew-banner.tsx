
/**
 * A crew banner: an emblem, a pattern and a colour.
 *
 * ---
 *
 * ## Why a crew gets to own anything at all
 *
 * Because before this it owned nothing. A crew was a name, a tag and a weekly
 * number, which is a row in a table rather than a thing a group of people
 * feels part of. The cheapest honest fix is one drawing they picked.
 *
 * ## Why it is this small
 *
 * Five emblems, four patterns, five colours. No editor, no layers, no upload,
 * no text on the banner, and nothing that could carry an image somebody else
 * made. A crew is four teenagers, not a guild, and the moment this becomes a
 * customisation surface it starts competing with the prevention experiences
 * for the time nobody has.
 *
 * ## Not colour alone
 *
 * The emblem is a distinct shape and the pattern is a distinct geometry, so a
 * crew is identifiable without seeing the accent at all. Two crews that
 * differed only by hue would be two crews to anybody with a colour vision
 * difference, and the accent is the least load-bearing of the three choices on
 * purpose.
 *
 * All original SVG, drawn here, like everything else in the product.
 */

export type CrewEmblemId = "arrow" | "ring" | "bar" | "leaf" | "step";
export type CrewPatternId = "plain" | "banner-split" | "banner-make" | "banner-change" | "banner-together";

export const CREW_EMBLEMS: { id: CrewEmblemId; name: string }[] = [
  { id: "arrow", name: "Chevron" },
  { id: "ring", name: "Ring" },
  { id: "bar", name: "Bars" },
  { id: "leaf", name: "Leaf" },
  { id: "step", name: "Steps" },
];

/**
 * Patterns, and what earns them.
 *
 * `plain` is always available so a crew is never without a banner. The other
 * four are the cosmetic reward for a challenge, which is the only thing a
 * crew challenge pays: no XP, no voucher eligibility, no currency, nothing
 * that compounds. See `src/data/crew-challenges.ts`.
 */
export const CREW_PATTERNS: { id: CrewPatternId; name: string; from: string | null }[] = [
  { id: "plain", name: "Plain", from: null },
  { id: "banner-split", name: "Split", from: "Split the favour between you" },
  { id: "banner-make", name: "Built", from: "Three quests, written by us" },
  { id: "banner-change", name: "Patched", from: "Everyone changes one thing" },
  { id: "banner-together", name: "Round", from: "One round, same room" },
];

const TINT: Record<string, string> = {
  quest: "#6e56f8",
  volt: "#b6f24a",
  coral: "#ff6b6b",
  pulse: "#22cde6",
  gold: "#f5b93f",
};

export function CrewBanner({
  emblem = "arrow",
  pattern = "plain",
  accent = "quest",
  size = 56,
  className,
}: {
  emblem?: CrewEmblemId;
  pattern?: CrewPatternId;
  accent?: string;
  size?: number;
  className?: string;
}) {
  const tint = TINT[accent] ?? TINT.quest;
  const id = `crew-${emblem}-${pattern}-${accent}`;

  return (
    <svg
      viewBox="0 0 48 56"
      width={size}
      height={Math.round((size / 48) * 56)}
      aria-hidden
      className={className}
    >
      <defs>
        <clipPath id={id}>
          {/* A hanging banner: square shoulders, a notched foot. */}
          <path d="M2 2 H46 V44 L24 54 L2 44 Z" />
        </clipPath>
      </defs>

      <g clipPath={`url(#${id})`}>
        <rect x="0" y="0" width="48" height="56" fill="#171b26" />
        <rect x="0" y="0" width="48" height="56" fill={tint} opacity="0.28" />
        {PATTERN[pattern](tint)}
      </g>

      <path
        d="M2 2 H46 V44 L24 54 L2 44 Z"
        fill="none"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="2"
      />
      <g transform="translate(24 24)">{EMBLEM[emblem](tint)}</g>
    </svg>
  );
}

/** Four earned geometries and one that is always there. */
const PATTERN: Record<CrewPatternId, (tint: string) => React.ReactElement> = {
  plain: () => <g />,
  /* Split: the banner divided down the middle, which is what the challenge is. */
  "banner-split": (tint) => <rect x="24" y="0" width="24" height="56" fill={tint} opacity="0.32" />,
  /* Built: stacked bricks. */
  "banner-make": (tint) => (
    <g fill={tint} opacity="0.3">
      <rect x="0" y="6" width="20" height="7" />
      <rect x="24" y="6" width="20" height="7" />
      <rect x="10" y="17" width="20" height="7" />
      <rect x="34" y="17" width="20" height="7" />
      <rect x="0" y="28" width="20" height="7" />
      <rect x="24" y="28" width="20" height="7" />
    </g>
  ),
  /* Patched: a corner mended with a cross-hatch. */
  "banner-change": (tint) => (
    <g stroke={tint} strokeWidth="2" opacity="0.34" fill="none">
      <path d="M0 44 L48 -4 M0 52 L48 4 M-4 36 L44 -12" />
    </g>
  ),
  /* Round: concentric arcs, for everybody answering twice. */
  "banner-together": (tint) => (
    <g stroke={tint} strokeWidth="2.4" fill="none" opacity="0.32">
      <circle cx="24" cy="24" r="10" />
      <circle cx="24" cy="24" r="17" />
      <circle cx="24" cy="24" r="24" />
    </g>
  ),
};

const EMBLEM: Record<CrewEmblemId, (tint: string) => React.ReactElement> = {
  arrow: (tint) => (
    <path d="M0 -9 L9 2 H4 V9 H-4 V2 H-9 Z" fill={tint} stroke="#0d1017" strokeWidth="1.2" />
  ),
  ring: (tint) => (
    <g>
      <circle r="9" fill="none" stroke={tint} strokeWidth="4" />
      <circle r="2.6" fill={tint} />
    </g>
  ),
  bar: (tint) => (
    <g fill={tint} stroke="#0d1017" strokeWidth="0.8">
      <rect x="-9" y="-8" width="5.5" height="16" rx="1.4" />
      <rect x="-2.6" y="-5" width="5.5" height="13" rx="1.4" />
      <rect x="3.8" y="-10" width="5.5" height="18" rx="1.4" />
    </g>
  ),
  leaf: (tint) => (
    <path
      d="M0 -10 C7 -5 8 4 0 10 C-8 4 -7 -5 0 -10 Z"
      fill={tint}
      stroke="#0d1017"
      strokeWidth="1.2"
    />
  ),
  step: (tint) => (
    <g fill={tint} stroke="#0d1017" strokeWidth="0.8">
      <rect x="-10" y="3" width="7" height="6" />
      <rect x="-3" y="-2" width="7" height="11" />
      <rect x="4" y="-8" width="7" height="17" />
    </g>
  ),
};
