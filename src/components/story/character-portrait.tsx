import { cn } from "@/lib/cn";
import type { CharacterId, Expression } from "@/types/story";

/**
 * Character portraits.
 *
 * Original SVG, drawn from the same geometric vocabulary as the SIDEQUEST mark:
 * one rounded container, one flat silhouette colour, one accent, no gradients,
 * no shading, no photographic reference. Nothing here is licensed from anywhere,
 * which is why `docs/ASSET_LICENSES.md` has nothing third-party to declare.
 *
 * Three rules constrain the drawing, and all three are deliberate.
 *
 * They are stylised rather than realistic. A realistic face at 40px is uncanny,
 * and it invites a reading this product refuses: SIDEQUEST does not suggest
 * that appearance predicts who offends. These are silhouettes with an eye line
 * and a mouth, distinguishable by shape and colour, not by features.
 *
 * Expression never carries an idea on its own. The dialogue always says the
 * thing; the face agrees with it. That is an accessibility requirement, since a
 * screen reader gets no expression at all, and it is what stops the portrait
 * becoming a puzzle.
 *
 * They are decorative in the accessibility tree. The speaker's name sits beside
 * every portrait as real text, so announcing the image would only duplicate it.
 */

const PALETTE: Record<CharacterId, { silhouette: string; accent: string; ring: string }> = {
  ken: { silhouette: "#f4794f", accent: "#2a1410", ring: "rgba(244,121,79,0.35)" },
  ilyas: { silhouette: "#5ac8e0", accent: "#0b2229", ring: "rgba(90,200,224,0.35)" },
  rina: { silhouette: "#c9a2ff", accent: "#1d1330", ring: "rgba(201,162,255,0.35)" },
  you: { silhouette: "#b6f24a", accent: "#16210a", ring: "rgba(182,242,74,0.35)" },
  narrator: { silhouette: "#7d8497", accent: "#14161d", ring: "rgba(125,132,151,0.3)" },
};

/** Hair and shoulder silhouettes, so the characters differ by shape as well as hue. */
const SILHOUETTE: Record<CharacterId, string> = {
  // Cropped, squared off.
  ken: "M8 13a8 8 0 0 1 16 0v3h-2v-3a6 6 0 0 0-12 0v3H8Z",
  // Longer at the sides.
  ilyas: "M7 15a9 9 0 0 1 18 0v6h-2.4v-6a6.6 6.6 0 0 0-13.2 0v6H7Z",
  // Tied back, with a fuller crown.
  rina: "M7 14a9 9 0 0 1 18 0v2h-2v-2a7 7 0 0 0-14 0v2H7Zm17 2c2.2 1 3 3.2 2.6 5.4l-2.2-.7c.3-1.6-.1-3-1.4-3.6Z",
  // Deliberately the simplest: it is whoever is holding the phone.
  you: "M9 14a7 7 0 0 1 14 0v2h-2v-2a5 5 0 0 0-10 0v2H9Z",
  narrator: "",
};

/** Mouth shapes. The only part that moves between expressions. */
const MOUTH: Record<Expression, string> = {
  neutral: "M13 23.4h6",
  uncertain: "M13 23.8c1.6-1 4.4-1 6 .4",
  amused: "M12.8 22.6c1.8 2 4.6 2 6.4 0",
  pressured: "M13 24.2c1.8-1.6 4.2-1.6 6 0",
  concerned: "M13 24.4c1.8-2 4.2-2 6 0",
  relieved: "M13.2 22.9c1.7 1.5 4 1.5 5.6 0",
};

/** Brow angle. Supports the mouth, never replaces it. */
const BROWS: Record<Expression, { left: string; right: string }> = {
  neutral: { left: "M11.4 17.6h3", right: "M17.6 17.6h3" },
  uncertain: { left: "M11.4 17.9l3-.8", right: "M17.6 17.1l3 .8" },
  amused: { left: "M11.4 17.2l3 .3", right: "M17.6 17.5l3-.3" },
  pressured: { left: "M11.4 16.9l3 1", right: "M17.6 17.9l3-1" },
  concerned: { left: "M11.4 17.9l3-1", right: "M17.6 16.9l3 1" },
  relieved: { left: "M11.4 17.5h3", right: "M17.6 17.5h3" },
};

export function CharacterPortrait({
  characterId,
  expression = "neutral",
  className,
}: {
  characterId: CharacterId;
  expression?: Expression;
  className?: string;
}) {
  const palette = PALETTE[characterId] ?? PALETTE.narrator;
  const silhouette = SILHOUETTE[characterId] ?? "";
  const mouth = MOUTH[expression];
  const brows = BROWS[expression];

  return (
    <span
      aria-hidden
      className={cn("grid size-10 shrink-0 place-items-center rounded-2xl", className)}
      style={{ background: palette.accent, boxShadow: `inset 0 0 0 1px ${palette.ring}` }}
    >
      <svg viewBox="0 0 32 32" className="size-full">
        {/* Head */}
        <rect x="10" y="14" width="12" height="13" rx="5" fill={palette.silhouette} />
        {/* Hair and shoulders */}
        {silhouette ? <path d={silhouette} fill={palette.silhouette} /> : null}
        {/* Eyes */}
        <circle cx="13.4" cy="20" r="1.1" fill={palette.accent} />
        <circle cx="18.6" cy="20" r="1.1" fill={palette.accent} />
        {/* Brows */}
        <g
          stroke={palette.accent}
          strokeWidth="1.1"
          strokeLinecap="round"
          fill="none"
          opacity="0.85"
        >
          <path d={brows.left} />
          <path d={brows.right} />
        </g>
        {/* Mouth */}
        <path
          d={mouth}
          stroke={palette.accent}
          strokeWidth="1.3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </span>
  );
}
