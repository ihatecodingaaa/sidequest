"use client";

import { Check, MapPin, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { CharacterPortrait } from "@/components/story/character-portrait";
import { LANDMARKS, NPCS, type Npc } from "@/features/streets/streets-data";
import type { StreetsBridge } from "@/features/streets/game/quest-bridge";

/**
 * The Quest List.
 *
 * A peer of the map, not a hidden fallback. A canvas cannot be read by a screen
 * reader, focused, or resized, so if walking were the only route into these
 * experiences the learning would be gated behind dexterity, and a prevention
 * product cannot do that to the people most likely to need it.
 *
 * Every destination in the district is here with its state, and every one can
 * be opened from here without moving a single step. "Walk there" is offered as
 * a convenience, not a requirement.
 */
export function QuestList({
  bridge,
  onClose,
  onWalkTo,
  onTalkTo,
}: {
  bridge: StreetsBridge;
  onClose: () => void;
  onWalkTo: (npc: Npc) => void;
  onTalkTo: (npc: Npc) => void;
}) {
  const remaining = NPCS.filter((npc) => npc.action.kind !== "safe" && !bridge.isNpcDone(npc));

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ink-900/96 backdrop-blur">
      <div className="flex items-center gap-3 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl font-extrabold tracking-tight text-chalk">
            Around the block
          </h2>
          <p className="mt-0.5 text-sm text-muted">
            {remaining.length > 0
              ? `${remaining.length} ${remaining.length === 1 ? "person is" : "people are"} waiting. Open anything from here.`
              : "You have been round everyone. Replay anything you like."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close quest list"
          className="sq-pressable grid size-11 shrink-0 place-items-center rounded-full bg-white/6 text-chalk"
        >
          <X aria-hidden className="size-5" />
        </button>
      </div>

      <ul className="min-h-0 flex-1 space-y-2.5 overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {NPCS.map((npc) => {
          const done = bridge.isNpcDone(npc);
          const landmark = LANDMARKS.find((entry) => entry.id === npc.landmarkId);
          const isSafe = npc.action.kind === "safe";

          return (
            <li
              key={npc.id}
              className={cn(
                "rounded-2xl border p-3.5",
                isSafe
                  ? "border-[#3d7de0]/40 bg-[#3d7de0]/8"
                  : done
                    ? "border-white/8 bg-white/2 opacity-75"
                    : "border-white/12 bg-white/4",
              )}
            >
              <div className="flex items-start gap-3">
                <CharacterPortrait
                  characterId={npc.characterId}
                  expression={done ? "relieved" : "neutral"}
                  className="size-11"
                />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-sm font-bold text-chalk">
                    {npc.name}
                    {done && !isSafe ? (
                      <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-volt-300">
                        <Check aria-hidden className="size-3" strokeWidth={3} />
                        Done
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-0.5 flex items-center gap-1.5 text-xs text-faint">
                    <MapPin aria-hidden className="size-3" />
                    {landmark?.name ?? "District 01"}
                  </p>
                  <p className="mt-1.5 text-sm leading-snug text-muted">
                    {done ? npc.doneLines[0] : npc.lines[0]}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onTalkTo(npc)}
                  className={cn(
                    "sq-pressable flex min-h-11 flex-1 items-center justify-center rounded-xl px-3 text-sm font-bold",
                    isSafe ? "bg-[#3d7de0] text-white" : "bg-volt-500 text-ink-900",
                  )}
                >
                  {npc.cta}
                </button>
                <button
                  type="button"
                  onClick={() => onWalkTo(npc)}
                  className="sq-pressable flex min-h-11 items-center justify-center rounded-xl border border-white/12 px-3.5 text-sm font-semibold text-mist"
                >
                  Go there
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
