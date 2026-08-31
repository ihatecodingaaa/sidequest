"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check } from "lucide-react";

import { cn } from "@/lib/cn";
import { useAudio } from "@/hooks/use-audio";
import { ACCENT_BG_SOFT, ACCENT_BORDER, ACCENT_TEXT } from "@/lib/accent";
import { SIGNAL_MODES } from "@/data/signals";
import { getMission } from "@/data/missions";
import { getOfficialResource } from "@/lib/official-links";
import { ExternalLink } from "@/components/ui/primitives";
import {
  ChoiceCards,
  Consequence,
  HotspotFinding,
  HotspotScene,
  OrderCards,
  PlanReveal,
} from "@/components/interaction";
import { SceneArt } from "@/features/streets/components/scene-art";
import { chosenResponse } from "@/data/prevention-threads";
import type { PreventionThread, ThreadStep } from "@/data/prevention-threads";
import type { StreetsBridge } from "@/features/streets/game/quest-bridge";
import type { HotspotSpot } from "@/types/interaction";
import type { AwardResult } from "@/lib/xp";

/**
 * One step of a Prevention Thread, played in the world's own dialogue sheet.
 *
 * The debrief contract, which the rest of the product is on:
 *
 * > **Play first. One takeaway. Detail on request.**
 *
 * Visible by default is the consequence, one line of takeaway, the XP and the
 * way out. The source and the mechanism sit behind a disclosure, because a
 * thirty second street encounter that ends in four paragraphs is where a game
 * stops being a game.
 *
 * ---
 *
 * ## Which interaction a step gets
 *
 * The step declares it, and the story decides which one the step declares. A
 * `decision` gets choice cards, a `hotspot` gets a tappable scene, an `order`
 * gets cards to place in sequence, and everything else gets one control that
 * says "Got it". Four steps of choice cards in a row was what testers were
 * describing when they said the tasks felt like a quiz, and the fix is not to
 * rotate mechanics on a schedule: it is to let a step that is about a *place*
 * be about a place.
 *
 * Nothing here scores anybody. Every option gets an honest outcome, none costs
 * XP, and the option marked safest is named as what worked rather than as the
 * right answer, because these are rehearsals and punishing a fictional choice
 * teaches people to stop making them out loud.
 */
export function ThreadPanel({
  thread,
  step,
  bridge,
  onClose,
}: {
  thread: PreventionThread;
  step: ThreadStep;
  bridge: StreetsBridge;
  onClose: () => void;
}) {
  const audio = useAudio();
  const [chosen, setChosen] = useState<string | null>(null);
  const [award, setAward] = useState<AwardResult | null>(null);

  /* Hotspot state, local: the ledger lives in the store. */
  const [found, setFound] = useState<string[]>([]);
  const [inspecting, setInspecting] = useState<HotspotSpot | null>(null);

  /* Order state, likewise. */
  const [placed, setPlaced] = useState<string[]>([]);

  const mode = SIGNAL_MODES[step.mode];
  const choice = chosen ? step.choices?.find((entry) => entry.id === chosen) : undefined;
  const banked = award !== null;

  /* Completing the last required step finishes the story. */
  const state = bridge.threadState(thread.id);
  const finished = banked && state.complete;

  const bank = (choiceId?: string) => {
    setAward(bridge.completeStep(thread, step, choiceId) ?? ({ awarded: false } as AwardResult));
  };

  const take = (choiceId: string) => {
    setChosen(choiceId);
    bank(choiceId);
  };

  /*
   * The response half of the plan, read from what the player actually chose.
   *
   * `bridge.threadChoices` lags by one render on the step that has just been
   * banked, because banking is what writes it, so the choice made on this very
   * screen is merged in rather than waited for.
   */
  const planResponse = chosenResponse(
    thread,
    choice ? { ...bridge.threadChoices, [`${thread.id}:${step.id}`]: choice.id } : bridge.threadChoices,
  );

  /*
   * Progress, once, at the moment it is banked.
   *
   * Three different weights for three genuinely different events: a step
   * inside a story, the story finishing, and the district visibly changing
   * because of it. Using one cue for all three would waste the only channel
   * that can tell a player, without reading, that this one mattered more.
   *
   * Every one of them accompanies something already on screen: an XP chip, a
   * takeaway, a line naming what changed. Nothing here is announced by sound
   * alone, which is both the accessibility rule and what makes the product
   * complete in silence.
   */
  useEffect(() => {
    if (!banked) return;
    if (finished) {
      audio.play("quest-resolve");
      /* The world reacting is its own event, and it lands after the resolve. */
      const timer = setTimeout(() => audio.play("world-change"), 420);
      return () => clearTimeout(timer);
    }
    audio.play(award?.awarded ? "quest-progress" : "ui-select");
  }, [banked, finished, award, audio]);

  const mission = step.kind === "hero-mission" && step.missionId ? getMission(step.missionId) : null;
  const official = step.official ? getOfficialResource(step.official) : undefined;

  const hotspot = step.hotspot;
  const order = step.order;

  const countingFound = hotspot
    ? found.filter((id) => hotspot.spots.some((spot) => spot.id === id && spot.counts)).length
    : 0;
  const hotspotReady = hotspot ? countingFound >= hotspot.required : false;

  const orderReady = order ? placed.length === order.cards.length : false;
  const orderMatched =
    order && orderReady && placed.every((id, index) => id === order.recommended[index]);

  /**
   * What the consequence says, per interaction.
   *
   * Every branch here produces option-specific feedback rather than a verdict,
   * which is the property that makes a choice list a learning event instead of
   * a guess. Butler and Roediger (2008) is the reason it is not optional.
   */
  const outcome = choice
    ? choice.outcome
    : hotspot && banked
      ? hotspot.resolution
      : order && banked
        ? orderMatched
          ? order.matched
          : order.differed
        : "";

  return (
    <div className="mt-4">
      {/*
        The mode, in words.
        Colour carries this in the world; here it is a label, which is the
        channel that survives a colour vision deficiency and the one a screen
        reader can actually reach.
      */}
      <p
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.65rem] font-bold tracking-[0.1em] uppercase",
          ACCENT_BG_SOFT[mode.accent],
          ACCENT_BORDER[mode.accent],
          ACCENT_TEXT[mode.accent],
        )}
      >
        {mode.label}
        <span className="sr-only">. {mode.means}</span>
      </p>

      {!banked ? (
        <>
          {/* ------------------------------------------------ Choice cards */}
          {step.choices ? (
            <ChoiceCards
              className="mt-3"
              options={step.choices.map((entry) => ({ id: entry.id, label: entry.label }))}
              legend="What do you do?"
              onChoose={take}
            />
          ) : hotspot ? (
            /* --------------------------------------------------- Hotspot */
            <div className="mt-3">
              <p className="text-sm font-semibold text-chalk">{hotspot.prompt}</p>

              <HotspotScene
                className="mt-2.5"
                label={step.title}
                scene={<SceneArt id={hotspot.sceneId} />}
                spots={hotspot.spots}
                intent="observe"
                foundIds={found}
                accent={mode.accent}
                onInspect={(spot) => {
                  setInspecting(spot);
                  setFound((current) =>
                    current.includes(spot.id) ? current : [...current, spot.id],
                  );
                }}
              />

              {/*
                Progress by shape and by a stated count, never colour alone.
                The count is what tells somebody how much further to look, and
                it is the thing a screen reader reads.
              */}
              <div className="mt-3 flex items-center gap-2">
                {Array.from({ length: hotspot.required }).map((_, index) => (
                  <span
                    key={index}
                    aria-hidden
                    className={cn(
                      "h-1.5 flex-1 rounded-full",
                      index < countingFound ? "bg-volt-500" : "bg-white/10",
                    )}
                  />
                ))}
                <span className="ml-1 text-xs font-semibold text-faint tabular-nums">
                  {Math.min(countingFound, hotspot.required)}/{hotspot.required}
                </span>
              </div>

              {inspecting ? <HotspotFinding spot={inspecting} className="mt-3" /> : null}

              <button
                type="button"
                disabled={!hotspotReady}
                onClick={() => bank()}
                className={cn(
                  "sq-pressable mt-4 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold",
                  hotspotReady
                    ? "bg-volt-500 text-ink-900"
                    : "cursor-not-allowed bg-white/6 text-faint",
                )}
              >
                {hotspotReady
                  ? "Say what you found"
                  : `Find ${hotspot.required - countingFound} more`}
                {hotspotReady ? <ArrowRight aria-hidden className="size-4" /> : null}
              </button>
            </div>
          ) : order ? (
            /* ----------------------------------------------------- Order */
            <div className="mt-3">
              <p className="text-sm font-semibold text-chalk">{order.prompt}</p>

              <OrderCards
                className="mt-2.5"
                cards={order.cards}
                placed={placed}
                onPlace={(id) => setPlaced((current) => [...current, id])}
                onReset={() => setPlaced([])}
              />

              <button
                type="button"
                disabled={!orderReady}
                onClick={() => bank()}
                className={cn(
                  "sq-pressable mt-4 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl px-4 text-sm font-bold",
                  orderReady
                    ? "bg-volt-500 text-ink-900"
                    : "cursor-not-allowed bg-white/6 text-faint",
                )}
              >
                {orderReady
                  ? "That is the order"
                  : `Place ${order.cards.length - placed.length} more`}
                {orderReady ? <ArrowRight aria-hidden className="size-4" /> : null}
              </button>
            </div>
          ) : mission ? (
            <div className="mt-3 space-y-2.5">
              <p className="text-sm leading-relaxed text-muted">
                This step is {mission.title}. It opens the real thing and picks up here after.
              </p>
              <button
                type="button"
                onClick={() => {
                  bank();
                  bridge.open({ kind: "mission", missionId: mission.id });
                }}
                className="sq-pressable flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-volt-500 px-4 text-sm font-bold text-ink-900"
              >
                Play {mission.title}
                <ArrowRight aria-hidden className="size-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => bank()}
              className="sq-pressable mt-3 flex min-h-13 w-full items-center justify-center gap-2 rounded-2xl bg-volt-500 px-4 text-sm font-bold text-ink-900"
            >
              Got it
              <ArrowRight aria-hidden className="size-4" />
            </button>
          )}
        </>
      ) : (
        <Consequence
          className="mt-3"
          outcome={outcome}
          safer={choice?.safer}
          takeaway={finished ? thread.completion.takeaway : undefined}
          why={
            <>
              <span className="font-bold text-mist">{thread.source.label}.</span>{" "}
              {thread.source.body}
            </>
          }
          footer={
            <>
              {/*
                The real route, offered where the story just taught it.
                SIDEQUEST never takes a report: this hands off to the people
                whose job it is, and says what tapping will do before it does.
              */}
              {official ? (
                <div className="mt-4 rounded-2xl border border-coral-500/25 bg-coral-500/8 p-3.5">
                  <p className="text-sm font-bold text-chalk">{official.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-mist">{official.handoff}</p>
                  <ExternalLink
                    href={official.href}
                    className="sq-pressable mt-2.5 flex min-h-11 w-full items-center justify-center rounded-xl bg-coral-500 text-sm font-bold text-white"
                  >
                    {official.displayTarget}
                  </ExternalLink>
                </div>
              ) : null}

              <button
                type="button"
                onClick={onClose}
                className="sq-pressable mt-4 flex min-h-12 w-full items-center justify-center rounded-2xl bg-volt-500 text-sm font-bold text-ink-900"
              >
                Back to the block
              </button>
            </>
          }
        >
          {step.followUp ? (
            <p className="mt-3 text-sm leading-relaxed text-muted">{step.followUp}</p>
          ) : null}

          {/*
            The plan, and only at the end of the whole story.

            A choice card is an intention; an if-then plan is an intention with
            a cue attached, and the cue is the half with the evidence behind it.
            It is offered once, when the thread is finished, because a plan
            after every step would be four plans nobody made.
          */}
          {finished && thread.completion.plan && planResponse ? (
            <PlanReveal
              prompt={thread.completion.plan.prompt}
              cues={thread.completion.plan.cues}
              response={planResponse}
            />
          ) : null}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {award?.awarded ? (
              <p className="inline-flex items-center gap-2 rounded-full bg-volt-500/12 px-3.5 py-1.5 text-sm font-bold text-volt-300">
                <Check aria-hidden className="size-4" strokeWidth={3} />+{award.xpGained} XP
              </p>
            ) : (
              <p className="text-xs text-muted">Already counted. Replays add nothing.</p>
            )}
            <p className="text-xs text-faint">
              {finished ? thread.completion.worldChange : `Step ${state.done} of ${state.total}`}
            </p>
          </div>
        </Consequence>
      )}
    </div>
  );
}
