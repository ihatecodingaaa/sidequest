"use client";

import { useEffect, useState } from "react";
import { Check, Eye } from "lucide-react";

import { useAudio } from "@/hooks/use-audio";
import { ChoiceCards } from "@/components/interaction/choice-cards";
import { WorldSheet } from "@/features/streets/components/world-sheet";
import type { WorldProp } from "@/features/streets/streets-props";

/**
 * Looking at something in the world.
 *
 * ---
 *
 * ## Why this is deliberately small
 *
 * It is one or two lines and a way out. No XP, no scoring, no branch, no
 * disclosure, no source panel. Most of what a player looks at here teaches
 * nothing, and that is the point: a world where every object delivers a
 * prevention message is one nobody wants to walk around in, and a product that
 * cannot afford a bench with two names scratched on it has no room left for
 * anything to breathe.
 *
 * The sheet is the same `WorldSheet` a conversation uses, so a look and a talk
 * feel like the same kind of act in the same place, and so the landscape
 * behaviour is inherited rather than reinvented.
 *
 * ## Discoveries
 *
 * A few props leave something behind, and it is worth nothing. A district
 * moment is cosmetic, free, deterministic and permanently visible on You. It
 * pays no XP on purpose: paying for looking at benches would turn the
 * neighbourhood into a field to be harvested, and it would scale the reward
 * economy with the number of props, which is exactly the inflation the reward
 * rules forbid.
 *
 * The first time one is found, it is announced here rather than discovered
 * later on another screen, which is the same rule the Echo unlock follows.
 *
 * ## Things you can do, as opposed to things you can read
 *
 * A few props offer two or three harmless options: ring the bell or leave the
 * bike alone, take the shot or just bounce the ball. They award nothing, store
 * nothing and cannot be got wrong, and they use the same `ChoiceCards` a
 * mission uses, so the act of choosing feels identical whether the stakes are
 * a drinks machine or somebody's afternoon.
 *
 * That reuse is also the honest version of the interaction rule. A bespoke
 * minigame per prop would be several code paths and several accessibility
 * surfaces for an experience a player would not distinguish from this one.
 */
export function LookSheet({
  prop,
  found,
  onKeep,
  onClose,
  landscape,
}: {
  prop: WorldProp;
  /** Whether this discovery is already in the collection. */
  found: boolean;
  onKeep: (id: string) => void;
  onClose: () => void;
  landscape: boolean;
}) {
  const audio = useAudio();

  /*
   * Whether this is new is latched once, on open.
   *
   * Derived at mount rather than set from the effect below, because banking
   * the discovery immediately makes `found` true and the announcement would
   * otherwise vanish on the very next render. The sheet belongs to the moment
   * it opened in, exactly as the thread panel latches the step it opened on.
   */
  const [kept] = useState(() => Boolean(prop.discovery) && !found);

  /*
   * Which harmless thing they did, if the prop offered any.
   *
   * Component state and nothing else. It is not persisted, not counted and not
   * on the profile: walking away and coming back gives you the machine with
   * all three buttons again, because the interesting part was pressing one and
   * there is nothing here to complete.
   */
  const [picked, setPicked] = useState<string | null>(null);
  const choice = prop.choices?.find((entry) => entry.id === picked) ?? null;

  /*
   * The discovery is banked on open, not behind a button.
   *
   * Asking somebody to confirm that they would like to keep the thing they
   * just walked over and looked at is a dialog box in a game world. The
   * announcement below is the acknowledgement; the tap already happened.
   */
  useEffect(() => {
    if (!kept || !prop.discovery) return;
    onKeep(prop.discovery.id);
    audio.play("discover");
  }, [kept, prop, onKeep, audio]);

  return (
    <WorldSheet
      label={`Looking at ${prop.name}`}
      landscape={landscape}
      onClose={onClose}
      closeLabel="Stop looking"
    >
      <p className="flex items-center gap-2 text-xs font-bold tracking-[0.1em] text-faint uppercase">
        <Eye aria-hidden className="size-3.5" />
        {prop.name}
      </p>

      <div className="mt-2.5 space-y-2">
        {prop.lines.map((line) => (
          <p key={line} className="text-[1.05rem] leading-relaxed text-chalk">
            {line}
          </p>
        ))}
      </div>

      {prop.choices && !choice ? (
        <ChoiceCards
          className="mt-4"
          legend={`What do you do with ${prop.name.toLowerCase()}?`}
          options={prop.choices.map((entry) => ({ id: entry.id, label: entry.label }))}
          onChoose={setPicked}
        />
      ) : null}

      {choice ? (
        <p className="animate-rise mt-4 text-[1.05rem] leading-relaxed text-mist">
          {choice.response}
        </p>
      ) : null}

      {kept && prop.discovery ? (
        <p
          role="status"
          className="animate-rise mt-4 flex items-center gap-2 rounded-2xl border border-volt-500/30 bg-volt-500/8 px-4 py-3 text-sm font-semibold text-volt-300"
        >
          <Check aria-hidden className="size-4 shrink-0" strokeWidth={3} />
          Kept: {prop.discovery.label}
        </p>
      ) : null}

      {/*
        One way out, and it waits.

        While there are options on screen the sheet keeps its close control in
        the header and nothing else, so the choice is not competing with a
        primary button that also ends the moment. Exactly one advance control
        per screen is the story rule, and a look is a very small story.
      */}
      {prop.choices && !choice ? null : (
        <button
          type="button"
          onClick={onClose}
          className="sq-pressable mt-5 flex min-h-12 w-full items-center justify-center rounded-2xl bg-volt-500 text-sm font-bold text-ink-900"
        >
          Back to the block
        </button>
      )}
    </WorldSheet>
  );
}
