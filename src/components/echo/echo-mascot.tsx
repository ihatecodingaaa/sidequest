import { cn } from "@/lib/cn";
import type { EchoStyleId } from "@/data/echo-styles";

/**
 * ECHO.
 *
 * Echo used to be a ring with a stroke through it: a logo that talks. Nobody
 * forms an attachment to a logo that talks, and it had no silhouette, so it
 * read as one icon among the others in the set.
 *
 * This is a character. The construction is deliberate on every count:
 *
 *   Body      a shield, softened. It is the SIDEQUEST mark's own outline with
 *             the corners eased, so the mascot and the logo are visibly the
 *             same object and the product still looks like one product.
 *   Visor     a dark inset panel carrying the face. Keeping the face inside a
 *             panel is what stops this becoming a blob with eyes, and it gives
 *             the expression somewhere to live that reads at 28px.
 *   Eyes      small, precise, geometric. Not big, not glossy, no highlights and
 *             no blush. That is the entire line between characterful and
 *             condescending, and this product is about shop theft and money
 *             mule recruitment, so it stays on the correct side of it.
 *   Crest     the per-variant ornament above the body. This is what makes the
 *             collection structural rather than five colour swaps.
 *
 * Readability is a hard requirement rather than an aspiration: 28px inline in a
 * line of text, and 120px on a completion screen, from the same 64 unit
 * drawing. Nothing here relies on detail that disappears at the small size.
 *
 * Decorative by default. Echo never carries information the words do not also
 * state, so `aria-hidden` is correct unless a caller passes a label, which only
 * the collection does because there the character *is* the content.
 */

export type EchoExpression =
  | "neutral"
  | "thinking"
  | "pleased"
  | "concerned"
  | "surprised"
  | "proud";

/* --------------------------------------------------------------- Faces */

/**
 * Eyes and mouth per expression, on the 64 unit grid.
 *
 * Expression is carried by the mouth and the eye shape together, never by
 * colour, and never alone: the copy beside Echo always states the thing. A
 * screen reader gets no expression at all, so anything only in the face would
 * be information some users never receive.
 */
type EyeKind = "lines" | "paths" | "dots";

const FACE: Record<
  EchoExpression,
  { left: string; right: string; mouth: string; eyes: EyeKind }
> = {
  neutral: {
    left: "M25 30.4v4.2",
    right: "M39 30.4v4.2",
    mouth: "M28.5 41.5h7",
    eyes: "lines",
  },
  thinking: {
    /*
     * One eye narrowed to a dash, the other open, and the mouth pushed off
     * centre. Asymmetry is what separates "considering" from "unhappy": the
     * first version used a frown for both and they were indistinguishable.
     */
    left: "M22.6 32.6h4.8",
    right: "M39 30.4v4.2",
    mouth: "M29 41.8c1.6-1 3.6-1 5.2.2",
    eyes: "paths",
  },
  pleased: {
    // Arced eyes. The classic, and it survives at 28px where a smile does not.
    left: "M22.6 32.5c1.4-2 3.4-2 4.8 0",
    right: "M36.6 32.5c1.4-2 3.4-2 4.8 0",
    mouth: "M28 40.6c1.9 2.2 4.3 2.2 6.2 0",
    eyes: "paths",
  },
  concerned: {
    // Both eyes open and level, mouth turned down. Symmetry is the tell.
    left: "M25 30.4v4.2",
    right: "M39 30.4v4.2",
    mouth: "M28.4 42.6c1.9-2.2 4.3-2.2 6.2 0",
    eyes: "lines",
  },
  surprised: {
    left: "",
    right: "",
    mouth: "",
    eyes: "dots",
  },
  proud: {
    left: "M22.6 32.6c1.4-2.2 3.4-2.2 4.8 0",
    right: "M36.6 32.6c1.4-2.2 3.4-2.2 4.8 0",
    mouth: "M27.4 40c2.4 3.4 6.8 3.4 9.2 0",
    eyes: "paths",
  },
};

/* -------------------------------------------------------------- Crests */

/**
 * The per-variant ornament.
 *
 * Structural rather than tinted, so the collection reads as five characters
 * rather than one character in five colours. Each shape also means something:
 * Shift carries a second offset arc because it is earned by a group changing
 * its mind, Architect is squared off because it is earned by redesigning a
 * system, Scout has a raised marker because it is earned by going outside.
 */
function Crest({ style }: { style: EchoStyleId }) {
  if (style === "shift") {
    return (
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity="0.9"
      >
        <path d="M22 12.5c3.4-3.6 7.6-5.4 10-5.4s6.6 1.8 10 5.4" />
        <path d="M17.5 17.5c4.6-5.4 10-8 14.5-8s9.9 2.6 14.5 8" opacity="0.4" />
      </g>
    );
  }

  if (style === "signal") {
    return (
      <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
        <path d="M32 13V5.5" />
        <circle cx="32" cy="4" r="2.6" fill="currentColor" stroke="none" />
        <path d="M24.5 9.5c1.6-2 3.6-3.4 5.4-4" opacity="0.45" fill="none" />
        <path d="M39.5 9.5c-1.6-2-3.6-3.4-5.4-4" opacity="0.45" fill="none" />
      </g>
    );
  }

  if (style === "scout") {
    return (
      <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M32 12.5V6" />
        <path d="M32 6l8 2.6-8 2.8" fill="currentColor" stroke="none" />
      </g>
    );
  }

  if (style === "architect") {
    return (
      <g stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 13V8h22v5" fill="none" />
        <path d="M27 8V4.5M37 8V4.5" opacity="0.5" />
      </g>
    );
  }

  /* Core: a single steady arc. The one everybody starts with. */
  return (
    <path
      d="M23 12.4c2.8-3 5.9-4.6 9-4.6s6.2 1.6 9 4.6"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
  );
}

/* ------------------------------------------------------------- Mascot */

export function EchoMascot({
  expression = "neutral",
  style = "core",
  size = 44,
  /** Accessible name. Omit for decoration, which is almost always correct. */
  label,
  className,
}: {
  expression?: EchoExpression;
  style?: EchoStyleId;
  size?: number;
  label?: string;
  className?: string;
}) {
  const face = FACE[expression];
  const labelProps = label
    ? ({ role: "img", "aria-label": label } as const)
    : ({ "aria-hidden": true } as const);

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      {...labelProps}
      className={cn("shrink-0", className)}
    >
      {/* Crest sits behind the body so the body always reads as the front. */}
      <Crest style={style} />

      {/*
        The body: the SIDEQUEST shield with its corners eased. Same object as
        the logo, softer, which is what lets a mascot exist without introducing
        a second visual language.
      */}
      <path
        d="M32 11.5 13.5 18v16.6c0 10.9 7.6 19.7 18.5 22.4 10.9-2.7 18.5-11.5 18.5-22.4V18L32 11.5Z"
        fill="currentColor"
      />

      {/* Visor. Gives the face a home and keeps it legible at 28px. */}
      <rect x="18.5" y="23.5" width="27" height="23" rx="9" className="text-ink-900" fill="currentColor" opacity="0.92" />

      <g
        className="text-chalk"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      >
        {face.eyes === "dots" ? (
          <>
            <circle cx="25" cy="32.4" r="3" fill="currentColor" stroke="none" />
            <circle cx="39" cy="32.4" r="3" fill="currentColor" stroke="none" />
            <circle cx="32" cy="41.6" r="2.4" fill="currentColor" stroke="none" />
          </>
        ) : (
          <>
            <path d={face.left} />
            <path d={face.right} />
          </>
        )}
        {face.mouth ? <path d={face.mouth} strokeWidth="2.6" /> : null}
      </g>
    </svg>
  );
}
