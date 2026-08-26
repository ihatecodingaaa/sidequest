"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/hooks/use-profile";
import { CharacterPortrait } from "@/components/story/character-portrait";
import type { CharacterId, Expression, StoryLine, StoryLineInput } from "@/types/story";
import { toStoryLines } from "@/types/story";

/**
 * Player-paced story.
 *
 * Every narrative surface used to render its whole segment at once: three
 * paragraphs, roughly seven lines on a 390px phone, then one small button. The
 * testers called that "too many words", and the measurement agreed, but the fix
 * is not deleting sentences. Mayer and Chandler (2001) found that adding a
 * simple click-to-continue between segments improved understanding of the *same
 * material*, because the reader controls the pace instead of the page. So this
 * segments rather than truncates.
 *
 * The unit is one idea, not one sentence. Splitting a single thought across two
 * taps would reintroduce exactly the split attention segmenting exists to
 * remove, so tightly coupled lines are authored into one beat.
 *
 * There is deliberately **one** advance control, and the host places it. Every
 * screen here already has a fixed bottom action bar, so a second inline
 * "continue" would mean two ways to do the same thing in two places, one of
 * which silently skips the scene. `useStoryBeat` hands the host the state and
 * the host renders the button its shell expects.
 *
 * Accessibility rules this keeps:
 *
 *   - revealed lines stay in the DOM, so the scene can be re-read and a screen
 *     reader can review it;
 *   - new lines are announced through a polite live region;
 *   - the speaker is named in text, never only by portrait and never only by
 *     expression;
 *   - Enter, Space and ArrowDown advance, as well as the button;
 *   - under reduced motion nothing animates, and nothing is hidden that would
 *     otherwise have been shown.
 */
export interface StoryBeatState {
  lines: StoryLine[];
  /** How many are on screen. */
  revealed: number;
  complete: boolean;
  /** Reveals the next line, or does nothing once complete. */
  advance: () => void;
  /** Reveals everything at once. Used by "skip scene". */
  revealAll: () => void;
}

export function useStoryBeat(input: readonly StoryLineInput[]): StoryBeatState {
  const lines = useMemo(() => toStoryLines(input), [input]);
  const [revealed, setRevealed] = useState(1);

  /*
   * There is no reset here on purpose. A component that plays more than one
   * scene gives its scene component a React `key`, which remounts it and
   * restarts the reveal for free. Detecting the change in here instead would
   * mean either writing a ref during render or setting state in an effect, and
   * React 19 lints both, correctly.
   */
  const complete = revealed >= lines.length;

  const advance = useCallback(() => {
    setRevealed((n) => Math.min(lines.length, n + 1));
  }, [lines.length]);

  const revealAll = useCallback(() => setRevealed(lines.length), [lines.length]);

  return { lines, revealed, complete, advance, revealAll };
}

export function StoryBeat({
  beat,
  slug,
  children,
  inlineAdvance = false,
  className,
}: {
  beat: StoryBeatState;
  /** Scene label, e.g. "Thursday, 4:12pm". Rendered once, above the lines. */
  slug?: string;
  /** Rendered once the scene is finished. Usually the choice list. */
  children?: React.ReactNode;
  /**
   * Renders the advance control inline instead of expecting the host to place
   * it. Only for surfaces with no fixed action bar of their own, such as a
   * scenario beat whose choices sit in the body.
   */
  inlineAdvance?: boolean;
  className?: string;
}) {
  const reduced = usePrefersReducedMotion();
  const endRef = useRef<HTMLDivElement | null>(null);
  const { lines, revealed, complete, advance } = beat;

  useEffect(() => {
    if (revealed <= 1) return;
    endRef.current?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "nearest",
    });
  }, [revealed, reduced]);

  useEffect(() => {
    if (complete) return;
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      // Never steal a key from a control the player is actually using.
      if (target && /^(BUTTON|A|INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.key === "Enter" || event.key === " " || event.key === "ArrowDown") {
        event.preventDefault();
        advance();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance, complete]);

  return (
    <div className={cn("relative flex min-h-[62vh] flex-col", className)}>
      {slug ? (
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-faint">{slug}</p>
      ) : null}

      <div className="space-y-4" aria-live="polite" aria-atomic="false">
        {lines.slice(0, revealed).map((line, index) => (
          <StoryLineView
            key={index}
            line={line}
            fresh={index === revealed - 1 && index > 0 && !reduced}
          />
        ))}
      </div>

      <div ref={endRef} aria-hidden className="h-px" />

      {/*
        The advance control sits below a spacer that grows as the scene does, so
        it stays near the bottom of the viewport instead of floating directly
        under a single opening line with a screen of emptiness beneath it. It is
        still in flow, so it never covers the text it is advancing.
      */}
      {inlineAdvance && !complete ? (
        <>
          <div aria-hidden className="min-h-[18vh] flex-1" />
          <button
            type="button"
            onClick={advance}
            className="sq-pressable mt-6 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/4 text-sm font-semibold text-mist hover:bg-white/7"
          >
            Tap to continue
            <ChevronDown aria-hidden className={cn("size-4", !reduced && "animate-nudge")} />
          </button>
        </>
      ) : null}

      {complete && children ? <div className="mt-7">{children}</div> : null}
    </div>
  );
}

/**
 * The label for the single advance control, so every host words it the same
 * way: the scene is still going, or it is the player's turn.
 */
export function storyBeatLabel(beat: StoryBeatState, doneLabel: string): string {
  return beat.complete ? doneLabel : "Continue";
}

function StoryLineView({ line, fresh }: { line: StoryLine; fresh: boolean }) {
  if (line.kind === "thread") {
    return (
      <ul className={cn("space-y-2", fresh && "animate-rise")}>
        {line.messages.map((message, index) => (
          <li key={index}>
            <Bubble message={message} />
          </li>
        ))}
      </ul>
    );
  }

  if (line.kind === "message") {
    return (
      <div className={cn(fresh && "animate-rise")}>
        <Bubble message={line} />
      </div>
    );
  }

  if (line.kind === "exchange") {
    return (
      <div className={cn("space-y-3", fresh && "animate-rise")}>
        {line.turns.map((turn, index) => (
          <Speech key={index} turn={turn} />
        ))}
      </div>
    );
  }

  if (line.kind === "speech") {
    return (
      <div className={cn(fresh && "animate-rise")}>
        <Speech turn={line} />
      </div>
    );
  }

  return (
    <p className={cn("text-[1.05rem] leading-relaxed text-mist", fresh && "animate-rise")}>
      {line.text}
    </p>
  );
}

function Bubble({
  message,
}: {
  message: { from: string; text: string; isYou?: boolean };
}) {
  return (
    <div className={cn("flex", message.isYou ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[82%] rounded-2xl px-3.5 py-2",
          message.isYou
            ? "rounded-br-sm bg-quest-500/20 text-chalk"
            : "rounded-bl-sm bg-white/6 text-mist",
        )}
      >
        {!message.isYou ? (
          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-faint">
            {message.from}
          </p>
        ) : null}
        <p className="text-sm leading-snug">{message.text}</p>
      </div>
    </div>
  );
}

function Speech({
  turn,
}: {
  turn: { characterId: CharacterId; speaker: string; text: string; expression?: Expression };
}) {
  return (
    <div className="flex gap-3">
      <CharacterPortrait
        characterId={turn.characterId}
        expression={turn.expression}
        className="mt-0.5 size-11"
      />
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-[0.08em] text-quest-300">
          {turn.speaker}
        </p>
        <p className="mt-1 text-[1.05rem] leading-relaxed text-chalk">{turn.text}</p>
      </div>
    </div>
  );
}
