"use client";

import { Check, MapPin, Monitor, StickyNote, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_BG_SOFT, ACCENT_BORDER, ACCENT_TEXT } from "@/lib/accent";
import { SIGNAL_MODES, type SignalMode } from "@/data/signals";
import { CharacterPortrait } from "@/components/story/character-portrait";
import {
  DISTRICT_ID,
  LANDMARKS,
  MAPS,
  NPCS,
  type Npc,
} from "@/features/streets/streets-data";
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
 * be opened from here without moving a single step. "Go there" is offered as a
 * convenience, not a requirement.
 *
 * Which is also why the three interiors are listed rather than hidden behind
 * their doors. A room whose contents can only be reached by walking into it
 * would put the shop floor check out of reach of exactly the people this rule
 * exists for.
 */

/** Anything that can be finished, so the header count means something. */
const COUNTABLE = new Set(["mission", "campaign", "check", "thread"]);

/**
 * The Signal mode, in words.
 *
 * This is the channel that matters most here. In the world the mode is a
 * colour and a silhouette; in this list it is a label and an accessible name,
 * which is what makes the whole system usable without colour vision and
 * readable by a screen reader.
 */
function SignalChip({ mode }: { mode: SignalMode }) {
  const spec = SIGNAL_MODES[mode];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 rounded-full border px-2 py-0.5 text-[0.6rem] font-bold tracking-[0.1em] uppercase",
        ACCENT_BG_SOFT[spec.accent],
        ACCENT_BORDER[spec.accent],
        ACCENT_TEXT[spec.accent],
      )}
    >
      {spec.label}
      <span className="sr-only">. {spec.means}</span>
    </span>
  );
}

function groupsOf(npcs: Npc[]) {
  const order = [DISTRICT_ID, ...Object.keys(MAPS).filter((id) => id !== DISTRICT_ID)];
  return order
    .map((id) => ({
      id,
      label: id === DISTRICT_ID ? "On the street" : `Inside ${MAPS[id]?.name ?? "a building"}`,
      npcs: npcs.filter((npc) => (npc.mapId ?? DISTRICT_ID) === id),
    }))
    .filter((group) => group.npcs.length > 0);
}

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
  const remaining = NPCS.filter(
    (npc) => COUNTABLE.has(npc.action.kind) && !bridge.isNpcDone(npc),
  );
  const groups = groupsOf(NPCS);

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

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
        {groups.map((group) => (
          <section key={group.id} className="mb-5 last:mb-0">
            <h3 className="mb-2 text-[0.7rem] font-bold tracking-[0.14em] text-faint uppercase">
              {group.label}
            </h3>
            <ul className="space-y-2.5">
              {group.npcs.map((npc) => (
                <QuestRow
                  key={npc.id}
                  npc={npc}
                  done={bridge.isNpcDone(npc)}
                  signal={bridge.signals[npc.id]?.mode}
                  onWalkTo={onWalkTo}
                  onTalkTo={onTalkTo}
                />
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}

function QuestRow({
  npc,
  done,
  signal,
  onWalkTo,
  onTalkTo,
}: {
  npc: Npc;
  done: boolean;
  /** Which mode this row's situation is in, if it has one live. */
  signal?: SignalMode;
  onWalkTo: (npc: Npc) => void;
  onTalkTo: (npc: Npc) => void;
}) {
  const landmark = LANDMARKS.find((entry) => entry.id === npc.landmarkId);
  const isSafe = npc.action.kind === "safe";
  const figure = npc.figure ?? "person";
  const isFixture = figure !== "person";

  return (
    <li
      className={cn(
        "rounded-2xl border p-3.5",
        isSafe
          ? "border-[#3d7de0]/40 bg-[#3d7de0]/8"
          : isFixture
            ? "border-white/8 bg-white/2"
            : done
              ? "border-white/8 bg-white/2 opacity-75"
              : "border-white/12 bg-white/4",
      )}
    >
      <div className="flex items-start gap-3">
        {/* A machine gets a glyph, never a face. It is not a person. */}
        {isFixture ? (
          <span
            aria-hidden
            className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/5 text-mist"
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
            className="size-11"
          />
        )}
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-chalk">
            {npc.name}
            {signal ? <SignalChip mode={signal} /> : null}
            {done && !isSafe && !isFixture ? (
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
            {npc.situation && !done ? npc.situation : done ? npc.doneLines[0] : npc.lines[0]}
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => onTalkTo(npc)}
          className={cn(
            "sq-pressable flex min-h-11 flex-1 items-center justify-center rounded-xl px-3 text-sm font-bold",
            isSafe
              ? "bg-[#3d7de0] text-white"
              : isFixture
                ? "border border-white/12 text-mist"
                : "bg-volt-500 text-ink-900",
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
}
