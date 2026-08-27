"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, Check, Monitor, StickyNote, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { CharacterPortrait } from "@/components/story/character-portrait";
import { EchoMascot } from "@/components/echo/echo-mascot";
import { ExternalLink, ProvenanceTag } from "@/components/ui/primitives";
import { getOfficialResource } from "@/lib/official-links";
import { ThreadPanel } from "@/features/streets/components/thread-panel";
import { STREET_CHECKS, type Npc } from "@/features/streets/streets-data";
import type { StreetsBridge } from "@/features/streets/game/quest-bridge";
import type { AwardResult } from "@/lib/xp";

/**
 * NPC conversation, as DOM rather than canvas text.
 *
 * Everything readable lives here for one reason: a canvas has no semantics, so
 * text drawn inside it cannot be read by a screen reader, focused, or resized.
 * This overlay gets real focus management, real text rendering and real
 * buttons, and the world underneath simply stops moving while it is open.
 *
 * The dialogue contract from the brief is enforced by the data rather than by
 * hope: at most two short bubbles before the player does something. Nobody in
 * this district asks a quiz question. The situation arrives, then the choice.
 */
export function DialogueOverlay({
  npc,
  done,
  bridge,
  onClose,
  onOpenRewards,
  onOpenHub,
}: {
  npc: Npc;
  done: boolean;
  bridge: StreetsBridge;
  onClose: () => void;
  /** The rewards counter is a screen of its own, opened from Mei's line. */
  onOpenRewards: () => void;
  /** The Crew board, likewise. */
  onOpenHub: () => void;
}) {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [beat, setBeat] = useState(0);

  const check = npc.action.kind === "check" ? STREET_CHECKS[npc.action.checkId] : undefined;
  const figure = npc.figure ?? "person";
  const isFixture = figure !== "person";
  /*
   * The thread step this conversation opened on.
   *
   * Resolved through the bridge rather than from the data, because whether a
   * step is live is a question about progress and progress lives in the store.
   *
   * **Latched once, on purpose.** Banking a step is exactly what makes it stop
   * being available, so reading it live meant the panel showing the outcome,
   * the XP and the way out was destroyed by the very action that produced
   * them: the sheet snapped back to the character's idle lines the instant the
   * player chose something. The conversation belongs to the step it started
   * with, and closing the sheet is what ends it.
   */
  const [threadStep] = useState(() => bridge.stepFor(npc));
  const official = npc.official ? getOfficialResource(npc.official) : undefined;
  /*
   * A live thread step speaks for itself. The NPC's standing lines are what
   * they say when they have nothing to hand you, which is why a finished
   * thread falls back to them.
   */
  const lines = threadStep ? threadStep.step.lines : done ? npc.doneLines : npc.lines;
  const linesDone = beat >= lines.length - 1;

  /* Street Check state, kept local: the ledger lives in the store. */
  const [chosen, setChosen] = useState<string | null>(null);
  const [award, setAward] = useState<AwardResult | null>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const option = check && chosen ? check.options.find((entry) => entry.id === chosen) : undefined;

  const choose = (optionId: string) => {
    if (!check) return;
    setChosen(optionId);
    setAward(bridge.completeCheck(check.id));
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-end bg-black/55 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close conversation"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={`Talking to ${npc.name}`}
        className="relative max-h-[85dvh] overflow-y-auto rounded-t-3xl border-t border-white/10 bg-ink-900 px-5 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-start gap-3">
          {/* A screen or a board gets a glyph. Only people get faces. */}
          {isFixture ? (
            <span
              aria-hidden
              className="grid size-12 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-mist"
            >
              {figure === "machine" ? (
                <Monitor className="size-5" />
              ) : (
                <StickyNote className="size-5" />
              )}
            </span>
          ) : (
            <CharacterPortrait
              characterId={npc.characterId}
              expression={done ? "relieved" : "neutral"}
              className="size-12"
            />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-quest-300">{npc.name}</p>

            {/* One idea per bubble, revealed at the player's pace. */}
            <div className="mt-1.5 space-y-2" aria-live="polite">
              {lines.slice(0, beat + 1).map((line, index) => (
                <p key={index} className="text-[1.05rem] leading-relaxed text-chalk">
                  {line}
                </p>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="sq-pressable -mt-1 -mr-2 grid size-11 shrink-0 place-items-center rounded-full text-faint hover:text-chalk"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>

        {!linesDone ? (
          <button
            type="button"
            onClick={() => setBeat((n) => n + 1)}
            className="sq-pressable mt-5 flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/4 text-sm font-semibold text-mist"
          >
            Continue
          </button>
        ) : null}

        {/* ------------------------------------------------ Street Check */}
        {check && linesDone ? (
          <div className="mt-5">
            {!chosen ? (
              <>
                <div className="space-y-2">
                  {check.setup.map((line) => (
                    <p key={line} className="text-sm leading-relaxed text-mist">
                      {line}
                    </p>
                  ))}
                </div>

                <p className="mt-5 text-xs font-semibold uppercase tracking-[0.12em] text-faint">
                  {check.question}
                </p>
                <div className="mt-2.5 space-y-2.5">
                  {check.options.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => choose(entry.id)}
                      className="sq-pressable flex min-h-14 w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/4 px-4 py-3 text-left text-[0.95rem] leading-snug font-medium text-chalk hover:bg-white/7"
                    >
                      <span className="flex-1">{entry.label}</span>
                      <ArrowRight aria-hidden className="size-4 shrink-0 text-faint" />
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="animate-rise">
                {/*
                  Consequence, never a verdict. Nothing here says "wrong", no XP
                  is taken away and every option gets an honest outcome, because
                  this is a rehearsal environment and punishing a fictional
                  choice teaches people to stop making them out loud.
                */}
                <p className="text-[1.05rem] leading-relaxed text-chalk">{option?.outcome}</p>

                <p className="mt-4 rounded-2xl border border-volt-500/25 bg-volt-500/8 px-4 py-3 text-sm leading-relaxed font-semibold text-volt-300">
                  {check.takeaway}
                </p>

                {award?.awarded ? (
                  <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-volt-500/12 px-3.5 py-1.5 text-sm font-bold text-volt-300">
                    <Check aria-hidden className="size-4" strokeWidth={3} />+{award.xpGained} XP
                  </p>
                ) : (
                  <p className="mt-3 text-xs text-muted">Already counted. Replays add nothing.</p>
                )}

                {/* Provenance after the interaction, never interrupting it. */}
                <p className="mt-4 text-xs leading-relaxed text-faint">
                  <span className="font-bold text-mist">{check.source.label}.</span>{" "}
                  {check.source.body}
                </p>

                <button
                  type="button"
                  onClick={onClose}
                  className="sq-pressable mt-5 flex min-h-12 w-full items-center justify-center rounded-2xl bg-volt-500 text-sm font-bold text-ink-900"
                >
                  Back to the block
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* -------------------------------------------- Prevention Thread */}
        {threadStep && linesDone ? (
          <ThreadPanel
            thread={threadStep.thread}
            step={threadStep.step}
            bridge={bridge}
            onClose={onClose}
          />
        ) : null}

        {/* ------------------------------------------------ Just to read */}
        {npc.action.kind === "info" && linesDone ? (
          <div className="mt-5">
            {/*
              Provenance on the screen that makes the claim. A noticeboard
              listing what the block is doing this week is invented content,
              and the reader finds that out here rather than in a document.
            */}
            {npc.provenance ? (
              <div className="rounded-2xl border border-white/10 bg-white/3 p-3.5">
                <ProvenanceTag provenance="seeded" compact />
                <p className="mt-1.5 text-xs leading-relaxed text-mist">{npc.provenance}</p>
              </div>
            ) : null}
            {/*
              The world summarises and attributes. It never restates an
              agency's page, and the way out is to the people who own it.
            */}
            {official ? (
              <ExternalLink
                href={official.href}
                className="sq-pressable mt-3 flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#3d7de0] text-sm font-bold text-white"
              >
                {official.label}
              </ExternalLink>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="sq-pressable mt-3 flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/4 text-sm font-semibold text-mist"
            >
              Done
            </button>
          </div>
        ) : null}

        {/* ------------------------------------------------- Hand over */}
        {!check && !threadStep && npc.action.kind !== "info" && npc.action.kind !== "thread" && linesDone ? (
          <div className="mt-5">
            {
              <div className="space-y-2.5">
                {npc.action.kind === "safe" ? (
                  <p className="text-sm leading-relaxed text-muted">
                    No XP here, and nothing to play. It opens the real thing.
                  </p>
                ) : null}
                {npc.action.kind === "rewards" ? (
                  <p className="text-sm leading-relaxed text-muted">
                    Nothing is spent here. XP is a threshold, and claiming takes none of it away.
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    if (npc.action.kind === "rewards") onOpenRewards();
                    else if (npc.action.kind === "hub") onOpenHub();
                    else bridge.open(npc.action);
                  }}
                  className={cn(
                    "sq-pressable flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-bold",
                    npc.action.kind === "safe"
                      ? "bg-[#3d7de0] text-white"
                      : npc.action.kind === "rewards"
                        ? "bg-gold-500 text-ink-900"
                        : "bg-volt-500 text-ink-900",
                  )}
                >
                  {npc.cta}
                  <ArrowRight aria-hidden className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="sq-pressable flex min-h-12 w-full items-center justify-center rounded-2xl text-sm font-semibold text-muted hover:text-chalk"
                >
                  Not now
                </button>
              </div>
            }
          </div>
        ) : null}

        {/* Echo reacts once, quietly, and only where it has something to add. */}
        {done && !isFixture && bridge.equippedEcho ? (
          <p className="mt-5 flex items-center gap-2.5 text-sm text-muted">
            <EchoMascot expression="pleased" style={bridge.equippedEcho} size={28} />
            That one is behind you.
          </p>
        ) : null}
      </div>
    </div>
  );
}
