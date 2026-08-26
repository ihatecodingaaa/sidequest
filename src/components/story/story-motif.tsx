import { cn } from "@/lib/cn";
import type { Accent } from "@/lib/accent";

/**
 * Editorial motifs for Updates.
 *
 * Updates was the one screen the previous pass left alone, and it was named as
 * the biggest thing outstanding: the hierarchy was right and the texture was
 * flat. The reason it stayed flat is that the obvious fix is the forbidden one.
 * A stock photograph of a worried teenager, or a generic illustration per
 * story, is decoration, and decoration next to text makes the text harder to
 * read rather than easier.
 *
 * So these draw the **object or system the story is about**, never a scene and
 * never a person's situation. Each one names its job:
 *
 *   group      going along with a group, with one person apart from it
 *   checkout   a self-checkout that cannot tell you what it just did
 *   account    an account being handed to somebody else
 *   message    a message asking for a code
 *   identity   two identical faces, one of which is not real
 *   community  people connected to each other
 *
 * Objects and systems carry information cheaply. Places do not, which is why
 * there is no motif for "a void deck" or "a shopping centre": the scene label
 * already says it in three words and an illustration would take a third of the
 * screen to say the same thing.
 *
 * All decorative. Every motif sits beside a headline that states the subject,
 * so announcing them would only repeat it.
 */
export type MotifId =
  | "group"
  | "checkout"
  | "account"
  | "message"
  | "identity"
  | "community";

const FIELD: Record<Accent, string> = {
  quest: "from-quest-500/22 to-quest-500/5 text-quest-300",
  pulse: "from-pulse-500/22 to-pulse-500/5 text-pulse-300",
  volt: "from-volt-500/22 to-volt-500/5 text-volt-300",
  coral: "from-coral-500/22 to-coral-500/5 text-coral-300",
  gold: "from-gold-500/22 to-gold-500/5 text-gold-400",
};

const STROKE = {
  fill: "none",
  strokeWidth: 2.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function StoryMotif({
  motif,
  accent = "pulse",
  className,
}: {
  motif: MotifId;
  accent?: Accent;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid place-items-center overflow-hidden rounded-2xl bg-gradient-to-br",
        FIELD[accent],
        className,
      )}
    >
      {/*
        Square glyph, sized off the container's height rather than its width, so
        a wide editorial banner and a small list thumbnail both fill properly.
        `size-[62%]` looked right on the square thumbnails and left the wide
        banner mostly empty.
      */}
      <svg viewBox="0 0 72 72" className="h-[72%] w-auto">
        <Glyph motif={motif} />
      </svg>
    </span>
  );
}

function Glyph({ motif }: { motif: MotifId }) {
  if (motif === "group") {
    /* Three together, one apart. The apart one is the whole story. */
    return (
      <g stroke="currentColor" {...STROKE}>
        <circle cx="22" cy="26" r="6.5" />
        <path d="M11 50c0-6.1 4.9-11 11-11s11 4.9 11 11" />
        <circle cx="38" cy="26" r="6.5" opacity="0.55" />
        <path d="M27 50c0-6.1 4.9-11 11-11s11 4.9 11 11" opacity="0.55" />
        <circle cx="58" cy="28" r="5.5" opacity="0.95" />
        <path d="M49 50c0-5 4-9 9-9s9 4 9 9" opacity="0.95" />
        <path d="M45.5 16v40" strokeDasharray="3 5" opacity="0.4" strokeWidth="2" />
      </g>
    );
  }

  if (motif === "checkout") {
    /* A terminal, a scan beam, and an item whose state is ambiguous. */
    return (
      <g stroke="currentColor" {...STROKE}>
        <rect x="12" y="12" width="48" height="32" rx="5" />
        <path d="M20 22h14M20 29h9" opacity="0.6" />
        <path d="M42 20v16" />
        <path d="M47 23v10M52 20v16" opacity="0.55" />
        <path d="M24 52h24" />
        <path d="M30 44v8M42 44v8" opacity="0.5" />
      </g>
    );
  }

  if (motif === "account") {
    /* A card handed over, with a hand under it. */
    return (
      <g stroke="currentColor" {...STROKE}>
        <rect x="10" y="16" width="38" height="25" rx="4" />
        <path d="M10 25h38" opacity="0.6" />
        <path d="M17 33h9" opacity="0.6" />
        <path d="M44 48c5 2 10 2 15-1" />
        <path d="M53 42l6 5-6 5" />
      </g>
    );
  }

  if (motif === "message") {
    /* A message asking for something numeric. */
    return (
      <g stroke="currentColor" {...STROKE}>
        <path d="M12 18a4 4 0 0 1 4-4h32a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H26l-10 8v-8a4 4 0 0 1-4-4Z" />
        <path d="M23 25h6M34 25h6" />
        <path d="M23 32h17" opacity="0.5" />
        <circle cx="56" cy="48" r="8" opacity="0.9" />
        <path d="M56 44.5v4.5" />
        <circle cx="56" cy="52.5" r="1.1" fill="currentColor" stroke="none" />
      </g>
    );
  }

  if (motif === "identity") {
    /* Two of the same face. One of them is not a person. */
    return (
      <g stroke="currentColor" {...STROKE}>
        <rect x="9" y="16" width="24" height="30" rx="7" />
        <circle cx="17" cy="29" r="1.6" fill="currentColor" stroke="none" />
        <circle cx="25" cy="29" r="1.6" fill="currentColor" stroke="none" />
        <path d="M17 37c2.4 2.2 5.6 2.2 8 0" />
        <rect x="39" y="16" width="24" height="30" rx="7" strokeDasharray="4 4" opacity="0.75" />
        <circle cx="47" cy="29" r="1.6" fill="currentColor" stroke="none" opacity="0.75" />
        <circle cx="55" cy="29" r="1.6" fill="currentColor" stroke="none" opacity="0.75" />
        <path d="M47 37c2.4 2.2 5.6 2.2 8 0" opacity="0.75" />
        <path d="M36 52h0" />
      </g>
    );
  }

  /* Community: people actually connected to each other. */
  return (
    <g stroke="currentColor" {...STROKE}>
      <circle cx="36" cy="18" r="6" />
      <circle cx="16" cy="48" r="6" opacity="0.75" />
      <circle cx="56" cy="48" r="6" opacity="0.75" />
      <path d="M32 23.5 20.5 42.5M39.5 23.5 51.5 42.5M22 48h28" opacity="0.55" />
    </g>
  );
}

/**
 * Which motif a story uses.
 *
 * Keyed by Pulse item, because the motif has to be about *that* story. A story
 * with no entry here simply gets no artwork, which is the correct outcome: no
 * visual without a job means some things do not get one.
 */
export const PULSE_MOTIF: Record<string, MotifId> = {
  "pulse-peer-pressure": "group",
  "pulse-selfcheckout": "checkout",
  "pulse-account-sharing": "account",
  "pulse-otp": "message",
  "pulse-job-scams": "message",
  "pulse-deepfake": "identity",
  "pulse-marketplace": "account",
  "pulse-community": "community",
};
