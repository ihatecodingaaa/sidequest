import { cn } from "@/lib/cn";
import type { CharacterId, Expression } from "@/types/story";

/**
 * The ONE BAD MINUTE cast.
 *
 * The previous version was honest about its own result: "at 40px, Ken reads as
 * an orange rounded square with a face." The construction was the problem. A
 * flat silhouette in one colour has nothing to separate the face from the head,
 * so the features drown at portrait size.
 *
 * This uses what made the Echo mascot work. Each character is built from three
 * separated layers rather than one shape:
 *
 *   Field   a soft tinted disc behind everything, so the portrait reads as a
 *           person-shaped thing against the card rather than a coloured blob.
 *   Hair    a real silhouette in the character's own colour, and the main way
 *           you tell them apart at a glance. Ken is cropped and squared, Ilyas
 *           is longer and swept, Rina is tied back with volume, You is the
 *           simplest because it is whoever is holding the phone.
 *   Face    a light skin-neutral plane with dark features on it, which is what
 *           gives the expression the contrast it needs at 40px.
 *
 * The rules from the art direction hold and they are not stylistic:
 *
 * These are stylised, never realistic. A realistic face at 40px is uncanny, and
 * a crime prevention product must not imply that appearance predicts who
 * offends.
 *
 * Expression never carries an idea on its own. The dialogue always says the
 * thing; the face agrees with it. A screen reader gets no expression at all.
 *
 * No character is drawn as a suspect or a victim. They are people in a
 * situation, which is the whole behavioural argument.
 */

interface Palette {
  /** Hair and silhouette. The character's identity colour. */
  hair: string;
  /** The soft field behind the portrait. */
  field: string;
  /** The face plane. Warm neutrals, not a skin-tone claim about anybody. */
  face: string;
  /** Features drawn on the face plane. */
  ink: string;
}

const PALETTE: Record<CharacterId, Palette> = {
  ken: { hair: "#e8663c", field: "rgba(232,102,60,0.16)", face: "#f0c9a8", ink: "#2b1409" },
  ilyas: { hair: "#2f9fbd", field: "rgba(47,159,189,0.16)", face: "#e7bd94", ink: "#0d2630" },
  rina: { hair: "#9a6bf0", field: "rgba(154,107,240,0.16)", face: "#f2d3b6", ink: "#1e1236" },
  you: { hair: "#8fbf2e", field: "rgba(143,191,46,0.16)", face: "#eec9a4", ink: "#16210a" },
  narrator: { hair: "#6d7488", field: "rgba(109,116,136,0.14)", face: "#c9ceda", ink: "#151821" },
};

/** Hair silhouettes on a 40 unit grid. Shape does the identifying, not hue. */
const HAIR: Record<CharacterId, string> = {
  // Cropped, squared off at the temples.
  ken: "M9.5 17.5V14c0-4.4 4.7-7.5 10.5-7.5S30.5 9.6 30.5 14v3.5h-3.2V15c0-2.6-3.2-4.4-7.3-4.4S12.7 12.4 12.7 15v2.5Z",
  // Longer, swept to one side, covering more of the brow.
  ilyas:
    "M8.8 19V14c0-4.6 5-7.8 11.2-7.8S31.2 9.4 31.2 14v5h-3.4v-4.2c0-1.4-1-2.4-2.6-2.4-2.6 0-4 1.8-8 1.8-2.6 0-4.4 1.2-4.4 3.2V19Z",
  // Tied back, with volume at the crown.
  rina: "M9.2 18.5V14c0-4.5 4.9-7.7 10.8-7.7S30.8 9.5 30.8 14v4.5h-3.3V15c0-2.7-3.3-4.6-7.5-4.6S12.5 12.3 12.5 15v3.5Zm21.6-1.2c2.6 1.1 3.7 3.6 3.1 6.3l-3.1-.8c.4-1.9-.1-3.4-1.4-4.2Z",
  // The simplest shape in the cast: it is you.
  you: "M10.5 17.5V14.6c0-4 4.2-6.9 9.5-6.9s9.5 2.9 9.5 6.9v2.9h-3V15c0-2.3-2.9-4-6.5-4s-6.5 1.7-6.5 4v2.5Z",
  narrator: "",
};

/** Mouths. The primary carrier of expression, and the one that survives 40px. */
const MOUTH: Record<Expression, string> = {
  neutral: "M16.6 27.4h6.8",
  uncertain: "M16.6 27.6c1.9-1.1 4.9-1.1 6.8.5",
  amused: "M16.2 26.3c2 2.3 5.6 2.3 7.6 0",
  pressured: "M16.6 28.2c2-1.8 4.8-1.8 6.8 0",
  concerned: "M16.6 28.5c2-2.2 4.8-2.2 6.8 0",
  relieved: "M16.4 26.6c2 1.8 5.2 1.8 7.2 0",
};

/** Brows. They support the mouth and never replace it. */
const BROWS: Record<Expression, { left: string; right: string }> = {
  neutral: { left: "M14 20.4h3.4", right: "M22.6 20.4h3.4" },
  uncertain: { left: "M14 20.8l3.4-1", right: "M22.6 19.8l3.4 1" },
  amused: { left: "M14 20l3.4.4", right: "M22.6 20.4l3.4-.4" },
  pressured: { left: "M14 19.6l3.4 1.2", right: "M22.6 20.8l3.4-1.2" },
  concerned: { left: "M14 20.9l3.4-1.3", right: "M22.6 19.6l3.4 1.3" },
  relieved: { left: "M14 20.2h3.4", right: "M22.6 20.2h3.4" },
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
  const hair = HAIR[characterId] ?? "";
  const mouth = MOUTH[expression];
  const brows = BROWS[expression];

  return (
    <span aria-hidden className={cn("block size-10 shrink-0", className)}>
      <svg viewBox="0 0 40 40" className="size-full">
        {/* Field. Gives the portrait a boundary without a hard frame. */}
        <circle cx="20" cy="20" r="19" fill={palette.field} />

        {/* Shoulders, cropped by the field. */}
        <path
          d="M20 24c6.8 0 12.4 4.6 13.4 10.6A19 19 0 0 1 20 39a19 19 0 0 1-13.4-4.4C7.6 28.6 13.2 24 20 24Z"
          fill={palette.hair}
          opacity="0.85"
        />

        {/* Face plane. The contrast the old version was missing. */}
        <rect x="12" y="12" width="16" height="17.5" rx="7" fill={palette.face} />

        {/* Hair over the face plane, so the hairline is a real edge. */}
        {hair ? <path d={hair} fill={palette.hair} /> : null}

        {/* Eyes */}
        <circle cx="16.6" cy="23" r="1.35" fill={palette.ink} />
        <circle cx="23.4" cy="23" r="1.35" fill={palette.ink} />

        <g
          stroke={palette.ink}
          strokeWidth="1.15"
          strokeLinecap="round"
          fill="none"
          opacity="0.9"
        >
          <path d={brows.left} />
          <path d={brows.right} />
        </g>

        <path
          d={mouth}
          stroke={palette.ink}
          strokeWidth="1.35"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </span>
  );
}
