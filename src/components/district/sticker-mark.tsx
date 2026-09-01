import { cn } from "@/lib/cn";
import type { StickerArt } from "@/data/district-stickers";

/**
 * The eight sticker marks, drawn in code.
 *
 * ---
 *
 * Original SVG, like every other drawing in this product. No stock, no icon
 * pack, no third-party art, nothing generated. Each one is the *thing the
 * sticker is about*, drawn flat: the minimart awning, the block silhouette,
 * the hoop, a kopi cup, the route round the block, an eye, a mark somebody
 * made, a sunrise.
 *
 * ## Why they are not icons
 *
 * A lucide icon at 44px would have been free and would have looked like a
 * settings row. These read as things somebody printed and stuck on, because
 * that is what they are meant to be: a small drawn object you got for having
 * been somewhere, rather than a status glyph.
 *
 * ## Legibility before earning
 *
 * The same drawing renders locked and unlocked. Locked is desaturated and
 * dimmed, never hidden, never a silhouette and never a question mark. A
 * collection with mystery slots is a slot machine with a nicer frame, and the
 * requirement is printed next to it in words anyway.
 *
 * Decorative in every use: the sticker's name is real text beside it.
 */
export function StickerMark({
  art,
  earned = true,
  size = 44,
  className,
}: {
  art: StickerArt;
  earned?: boolean;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      aria-hidden
      className={cn(earned ? "opacity-100" : "opacity-35 grayscale", className)}
    >
      {/* The sticker itself: a rounded tile with a paler border, like a print. */}
      <rect x="1.5" y="1.5" width="37" height="37" rx="11" fill={PAPER[art]} />
      <rect
        x="1.5"
        y="1.5"
        width="37"
        height="37"
        rx="11"
        fill="none"
        stroke="rgba(255,255,255,0.22)"
        strokeWidth="1.5"
      />
      {ART[art]}
    </svg>
  );
}

/** One ground colour per sticker, so a row of them reads as a set of objects. */
const PAPER: Record<StickerArt, string> = {
  awning: "#7a2f28",
  block: "#3b3172",
  hoop: "#4d5c1f",
  cup: "#6b4a16",
  route: "#1f4a52",
  eye: "#3d2f5e",
  spark: "#2f4f3a",
  sunrise: "#7a4a18",
};

const ART: Record<StickerArt, React.ReactElement> = {
  /* A shopfront awning with its scalloped edge and a lit doorway under it. */
  awning: (
    <g>
      <rect x="10" y="21" width="20" height="11" fill="#f2e6d2" />
      <rect x="17" y="25" width="6" height="7" fill="#7a2f28" />
      <path d="M8 20 L32 20 L32 15 L8 15 Z" fill="#e05a4a" />
      <path
        d="M8 20 q2 3 4 0 q2 3 4 0 q2 3 4 0 q2 3 4 0 q2 3 4 0 q2 3 4 0"
        fill="#e05a4a"
      />
      <rect x="8" y="14" width="24" height="1.6" fill="#f7f2e8" />
    </g>
  ),

  /* A void deck block: pilotis under, windows above. */
  block: (
    <g>
      <rect x="9" y="10" width="22" height="16" fill="#8b86c8" />
      <rect x="9" y="26" width="22" height="6" fill="#6f6ab0" />
      <g fill="#2a2450">
        <rect x="12" y="13" width="4" height="4" />
        <rect x="18" y="13" width="4" height="4" />
        <rect x="24" y="13" width="4" height="4" />
        <rect x="12" y="20" width="4" height="4" />
        <rect x="18" y="20" width="4" height="4" />
        <rect x="24" y="20" width="4" height="4" />
      </g>
      {/* The open void deck: columns, not walls. */}
      <g fill="#3b3172">
        <rect x="12" y="26" width="2.5" height="6" />
        <rect x="19" y="26" width="2.5" height="6" />
        <rect x="26" y="26" width="2.5" height="6" />
      </g>
    </g>
  ),

  /* A netless hoop on its backboard, which is the actual court in the world. */
  hoop: (
    <g>
      <rect x="12" y="9" width="16" height="11" rx="1" fill="#e8ecd8" />
      <rect x="17" y="13" width="6" height="5" fill="none" stroke="#4d5c1f" strokeWidth="1.4" />
      <rect x="19" y="20" width="2" height="4" fill="#c8d0a8" />
      <path
        d="M14 24 h12 v2 h-12 z"
        fill="#f0742c"
      />
      <path
        d="M15 26 l1.5 5 M20 26 l0 5 M25 26 l-1.5 5"
        stroke="#f0742c"
        strokeWidth="1.2"
        fill="none"
      />
    </g>
  ),

  /* A kopi cup with the plastic bag handle the kopitiam actually uses. */
  cup: (
    <g>
      <path d="M13 15 h14 l-2 17 h-10 z" fill="#f2e6d2" />
      <path d="M13.6 20 h12.8 l-1.6 12 h-9.6 z" fill="#5a3a1c" />
      <rect x="11" y="12.5" width="18" height="3" rx="1.2" fill="#f7f2e8" />
      <path
        d="M17 12.5 v-3 a3 3 0 0 1 6 0 v3"
        fill="none"
        stroke="#f7f2e8"
        strokeWidth="1.4"
      />
    </g>
  ),

  /* The route round the block: a closed loop with a stop at each corner. */
  route: (
    <g>
      <path
        d="M12 12 h16 v16 h-16 z"
        fill="none"
        stroke="#7fd4e0"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeDasharray="3 2.4"
      />
      <g fill="#f2f8fa">
        <circle cx="12" cy="12" r="2.6" />
        <circle cx="28" cy="12" r="2.6" />
        <circle cx="12" cy="28" r="2.6" />
        <circle cx="28" cy="28" r="2.6" />
        <circle cx="20" cy="12" r="2" />
        <circle cx="20" cy="28" r="2" />
      </g>
    </g>
  ),

  /* An open eye, for having looked at things nobody asked about. */
  eye: (
    <g>
      <path
        d="M8 20 q12 -9 24 0 q-12 9 -24 0 z"
        fill="#efe8fb"
      />
      <circle cx="20" cy="20" r="5" fill="#3d2f5e" />
      <circle cx="20" cy="20" r="2.2" fill="#0f0c18" />
      <circle cx="21.8" cy="18.2" r="1.1" fill="#efe8fb" />
    </g>
  ),

  /* A mark somebody made: a pencil crossing a four-point spark. */
  spark: (
    <g>
      <path
        d="M20 8 L22 17 L31 19 L22 21 L20 30 L18 21 L9 19 L18 17 Z"
        fill="#9ee6b4"
      />
      <path d="M24 12 l5 5 l-9 9 l-5.4 1.4 l1.4 -5.4 z" fill="#f2e6d2" />
      <path d="M24 12 l5 5 l-2 2 l-5 -5 z" fill="#c9b48c" />
    </g>
  ),

  /* A sun coming up behind the block line, for the first person you met. */
  sunrise: (
    <g>
      <circle cx="20" cy="23" r="8" fill="#ffcf6b" />
      <g stroke="#ffcf6b" strokeWidth="1.8" strokeLinecap="round">
        <path d="M20 9 v3.5" />
        <path d="M10.5 13 l2.4 2.4" />
        <path d="M29.5 13 l-2.4 2.4" />
      </g>
      <rect x="6" y="23" width="28" height="9" fill="#7a4a18" />
      <rect x="6" y="23" width="28" height="1.6" fill="#f7f2e8" />
    </g>
  ),
};
