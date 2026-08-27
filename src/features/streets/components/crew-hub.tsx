"use client";

import { useState } from "react";
import { Check, PenLine, Users, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_BG_SOFT, ACCENT_BORDER, ACCENT_TEXT } from "@/lib/accent";
import { SIGNAL_MODES } from "@/data/signals";
import { PREVENTION_THREADS } from "@/data/prevention-threads";
import { crewStanding } from "@/lib/crew-roles";
import { ProvenanceTag } from "@/components/ui/primitives";
import { useAppStore } from "@/store/app-store";
import { useProfile } from "@/hooks/use-profile";
import { WorldSheet } from "@/features/streets/components/world-sheet";
import type { StreetsBridge } from "@/features/streets/game/quest-bridge";

/**
 * The Community Safety Crew board.
 *
 * Three things a young person can do here: see what the block is working on,
 * see what they are like in it, and write one of their own.
 *
 * What is deliberately absent is every trapping of a law enforcement
 * interface. No case files, no clearance rate, no rank, no operations map, no
 * suspect anything. This is a youth community room with a noticeboard in it,
 * and the difference between that and a command centre is most of the reason
 * the feature is allowed to exist at all.
 */

type Tab = "board" | "role" | "build";

export function CrewHub({
  bridge,
  onClose,
  landscape,
}: {
  bridge: StreetsBridge;
  onClose: () => void;
  landscape: boolean;
}) {
  const [tab, setTab] = useState<Tab>("board");

  return (
    <WorldSheet
      label="Community Safety Crew board"
      landscape={landscape}
      onClose={onClose}
      closeLabel="Leave the Crew board"
    >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-[0.1em] text-volt-300 uppercase">
              Community Safety Crew
            </p>
            <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-chalk">
              What the block is working on
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              Not a police force, and nobody here pretends to be. Notice, support, connect,
              redirect, design, create.
            </p>
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

        <div role="tablist" aria-label="Crew board" className="mt-4 flex gap-2">
          {(
            [
              ["board", "Signals"],
              ["role", "Your role"],
              ["build", "Build a quest"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "sq-pressable min-h-11 flex-1 rounded-xl px-3 text-sm font-bold",
                tab === id
                  ? "bg-volt-500 text-ink-900"
                  : "border border-white/12 text-mist hover:text-chalk",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "board" ? <SignalBoard bridge={bridge} /> : null}
        {tab === "role" ? <RoleBoard bridge={bridge} /> : null}
        {tab === "build" ? <BuildBoard /> : null}
    </WorldSheet>
  );
}

/* --------------------------------------------------------------- Signals */

function SignalBoard({ bridge }: { bridge: StreetsBridge }) {
  return (
    <div className="mt-4">
      <ul className="space-y-2.5">
        {PREVENTION_THREADS.map((thread) => {
          const state = bridge.threadState(thread.id);
          const mode = SIGNAL_MODES[thread.mode];
          return (
            <li key={thread.id} className="rounded-2xl border border-white/12 bg-white/4 p-3.5">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "inline-flex rounded-full border px-2 py-0.5 text-[0.6rem] font-bold tracking-[0.1em] uppercase",
                      ACCENT_BG_SOFT[mode.accent],
                      ACCENT_BORDER[mode.accent],
                      ACCENT_TEXT[mode.accent],
                    )}
                  >
                    {mode.label}
                  </p>
                  <p className="mt-1.5 text-sm font-bold text-chalk">{thread.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted">{thread.hook}</p>
                </div>
                {state.complete ? (
                  <Check aria-hidden className="mt-1 size-4 shrink-0 text-volt-300" strokeWidth={3} />
                ) : null}
              </div>
              <p className="mt-2 text-xs text-faint">
                {state.complete
                  ? thread.completion.worldChange
                  : `${state.done} of ${state.total} steps · ${
                      thread.playMode === "solo" ? "Solo" : "Solo or crew"
                    } · about ${thread.estimatedMinutes} min`}
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 rounded-2xl border border-white/10 bg-white/3 p-3.5">
        <ProvenanceTag provenance="seeded" compact />
        <p className="mt-1.5 text-xs leading-relaxed text-mist">
          Written scenarios, not live incidents. Nothing on this board reports anything happening
          anywhere, and SIDEQUEST never takes a report.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Role */

function RoleBoard({ bridge }: { bridge: StreetsBridge }) {
  const { profile } = useProfile();
  const standing = crewStanding(profile);
  const current = bridge.role;

  return (
    <div className="mt-4">
      <div
        className={cn(
          "rounded-2xl border p-4",
          ACCENT_BG_SOFT[current.accent],
          ACCENT_BORDER[current.accent],
        )}
      >
        <p className="flex items-center gap-2 text-xs font-bold tracking-[0.1em] uppercase">
          <Users aria-hidden className={cn("size-4", ACCENT_TEXT[current.accent])} />
          <span className={ACCENT_TEXT[current.accent]}>Right now you are a</span>
        </p>
        <p className="mt-1 font-display text-2xl font-extrabold tracking-tight text-chalk">
          {current.name}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-mist">{current.blurb}</p>
      </div>

      <ul className="mt-3 space-y-1.5">
        {standing.map(({ role, points }) => (
          <li
            key={role.id}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/8 px-3.5 py-2.5"
          >
            <span className="min-w-0">
              <span className="text-sm font-semibold text-chalk">{role.name}</span>
              <span className="block text-xs text-faint">{role.blurb}</span>
            </span>
            <span className="shrink-0 text-sm font-bold text-mist tabular-nums">{points}</span>
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-faint">
        Roles are what you are like, not what you outrank. They read the capabilities you were
        already building, so nothing new is locked and nothing can be lost.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------ Build a quest */

const EMPTY = { title: "", hook: "", moment: "", response: "" };

function BuildBoard() {
  const { profile } = useProfile();
  const addQuestDraft = useAppStore((state) => state.addQuestDraft);
  const [form, setForm] = useState(EMPTY);
  const [saved, setSaved] = useState(false);

  const drafts = profile.questDrafts ?? [];
  const ready = form.title.trim().length > 2 && form.moment.trim().length > 4;

  const field = (key: keyof typeof EMPTY, label: string, placeholder: string, rows = 2) => (
    <label className="block">
      <span className="text-xs font-semibold tracking-[0.1em] text-faint uppercase">{label}</span>
      <textarea
        value={form[key]}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => {
          setForm({ ...form, [key]: event.target.value });
          setSaved(false);
        }}
        className="mt-1.5 w-full rounded-xl border border-white/12 bg-white/4 px-3.5 py-2.5 text-sm text-chalk placeholder:text-faint focus:border-volt-500/60 focus:outline-none"
      />
    </label>
  );

  return (
    <div className="mt-4">
      <div className="rounded-2xl border border-quest-500/25 bg-quest-500/8 p-3.5">
        <p className="flex items-center gap-2 text-xs font-bold tracking-[0.1em] text-quest-300 uppercase">
          <PenLine aria-hidden className="size-3.5" />
          Draft, review required
        </p>
        <p className="mt-1.5 text-xs leading-relaxed text-mist">
          Write the situation you have actually seen. Drafts stay on this device and go to a
          facilitator or a teacher before anything is ever published. Nothing written here becomes
          live content in the app.
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {field("title", "Call it something", "Two people, one bus stop")}
        {field("hook", "What is happening", "Somebody is being talked into something small")}
        {field("moment", "The moment somebody has to choose", "What is the decision, and who makes it")}
        {field("response", "What would actually work", "The move that costs the person the least")}
      </div>

      <button
        type="button"
        disabled={!ready}
        onClick={() => {
          addQuestDraft(form);
          setForm(EMPTY);
          setSaved(true);
        }}
        className={cn(
          "sq-pressable mt-4 flex min-h-12 w-full items-center justify-center rounded-2xl text-sm font-bold",
          ready ? "bg-volt-500 text-ink-900" : "cursor-not-allowed bg-white/6 text-faint",
        )}
      >
        Save as draft
      </button>

      {saved ? (
        <p role="status" className="mt-2 text-sm font-semibold text-volt-300">
          Saved. It is a draft, and it stays one until somebody reviews it.
        </p>
      ) : null}

      {drafts.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {drafts.map((draft) => (
            <li key={draft.id} className="rounded-xl border border-white/8 bg-white/2 px-3.5 py-2.5">
              <p className="flex items-center gap-2 text-sm font-bold text-chalk">
                {draft.title}
                <span className="rounded-full bg-white/8 px-2 py-0.5 text-[0.6rem] font-bold tracking-[0.08em] text-faint uppercase">
                  Draft
                </span>
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{draft.moment}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
