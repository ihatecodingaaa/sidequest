"use client";

import { useState } from "react";
import { Lock, X } from "lucide-react";

import { cn } from "@/lib/cn";
import {
  CREW_EMBLEMS,
  CREW_PATTERNS,
  CrewBanner,
  type CrewEmblemId,
  type CrewPatternId,
} from "@/components/crew/crew-banner";
import { CREW_CHALLENGES } from "@/data/crew-challenges";
import { useAppStore } from "@/store/app-store";
import { useProfile } from "@/hooks/use-profile";

const ACCENTS: { id: string; name: string; swatch: string }[] = [
  { id: "quest", name: "Violet", swatch: "bg-quest-500" },
  { id: "volt", name: "Lime", swatch: "bg-volt-500" },
  { id: "coral", name: "Coral", swatch: "bg-coral-500" },
  { id: "pulse", name: "Cyan", swatch: "bg-pulse-500" },
  { id: "gold", name: "Amber", swatch: "bg-gold-500" },
];

/**
 * Choosing the crew banner.
 *
 * ---
 *
 * Three rows of choices and a live preview. Everything is a tap: no typing, no
 * sliders, no colour picker, and no keyboard anywhere in it, which keeps it on
 * the right side of the input rule without needing an exception.
 *
 * ## Locked patterns say what unlocks them
 *
 * The four earned patterns are visible, drawn, named, and carry the sentence
 * that would earn them. Legible before earned is the same rule the Echo
 * collection and the district stickers follow, and for the same reason: a
 * locked slot with a question mark sells uncertainty rather than the thing.
 *
 * A locked pattern is marked with a lock icon **and** a text label, never by
 * colour or dimming alone.
 *
 * ## The honesty line is in the sheet, not in a footnote
 *
 * There is no backend, so four phones cannot agree on a banner. This says so
 * where the choice is made. A real version settles it once for the crew; this
 * one settles it for you, and pretending otherwise would be exactly the kind
 * of fake synchronisation the rest of the build refuses.
 */
export function CrewIdentityEditor({ onClose }: { onClose: () => void }) {
  const { profile, ready } = useProfile();
  const setCrewBanner = useAppStore((state) => state.setCrewBanner);

  const current = ready ? profile.crewBanner : undefined;
  const [emblem, setEmblem] = useState<CrewEmblemId>((current?.emblem as CrewEmblemId) ?? "arrow");
  const [pattern, setPattern] = useState<CrewPatternId>(
    (current?.pattern as CrewPatternId) ?? "plain",
  );
  const [accent, setAccent] = useState<string>(current?.accent ?? "quest");

  /* Which patterns this player has actually unlocked, derived, never stored. */
  const unlocked = new Set<string>(["plain"]);
  if (ready) {
    for (const challenge of CREW_CHALLENGES) {
      if (challenge.done(profile)) unlocked.add(challenge.unlocks);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink-900/70 backdrop-blur-sm sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Crew banner"
        className="animate-rise max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-white/10 bg-ink-800 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-extrabold text-chalk">Crew banner</h2>
            <p className="mt-1 text-sm text-muted">
              Set on this device. A real version would agree it once across the crew.
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

        <div className="mt-4 flex justify-center">
          <CrewBanner emblem={emblem} pattern={pattern} accent={accent} size={96} />
        </div>

        <Row label="Mark">
          {CREW_EMBLEMS.map((entry) => (
            <Choice
              key={entry.id}
              selected={emblem === entry.id}
              onClick={() => setEmblem(entry.id)}
              label={entry.name}
            >
              <CrewBanner emblem={entry.id} pattern="plain" accent={accent} size={34} />
            </Choice>
          ))}
        </Row>

        <Row label="Pattern">
          {CREW_PATTERNS.map((entry) => {
            const locked = !unlocked.has(entry.id);
            return (
              <Choice
                key={entry.id}
                selected={pattern === entry.id}
                disabled={locked}
                onClick={() => setPattern(entry.id)}
                label={locked ? `${entry.name}, locked` : entry.name}
              >
                <span className="relative">
                  <CrewBanner
                    emblem={emblem}
                    pattern={entry.id}
                    accent={accent}
                    size={34}
                    className={locked ? "opacity-35 grayscale" : undefined}
                  />
                  {locked ? (
                    <Lock
                      aria-hidden
                      className="absolute -right-1 -bottom-1 size-3.5 text-faint"
                      strokeWidth={3}
                    />
                  ) : null}
                </span>
              </Choice>
            );
          })}
        </Row>

        {/* What earns each locked one, in words, under the row it belongs to. */}
        {CREW_PATTERNS.filter((entry) => entry.from && !unlocked.has(entry.id)).length > 0 ? (
          <ul className="mt-2 space-y-1">
            {CREW_PATTERNS.filter((entry) => entry.from && !unlocked.has(entry.id)).map((entry) => (
              <li key={entry.id} className="text-xs text-faint">
                <span className="font-semibold text-muted">{entry.name}</span> comes from{" "}
                {entry.from}.
              </li>
            ))}
          </ul>
        ) : null}

        <Row label="Colour">
          {ACCENTS.map((entry) => (
            <Choice
              key={entry.id}
              selected={accent === entry.id}
              onClick={() => setAccent(entry.id)}
              label={entry.name}
            >
              <span className={cn("block size-7 rounded-full", entry.swatch)} />
            </Choice>
          ))}
        </Row>

        <button
          type="button"
          onClick={() => {
            setCrewBanner({ emblem, pattern, accent });
            onClose();
          }}
          className="sq-pressable mt-5 flex min-h-13 w-full items-center justify-center rounded-2xl bg-volt-500 py-3.5 text-sm font-bold text-ink-900"
        >
          Save
        </button>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="mt-5">
      <legend className="text-xs font-bold tracking-[0.12em] text-faint uppercase">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Choice({
  selected,
  disabled,
  onClick,
  label,
  children,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={selected}
      aria-label={label}
      className={cn(
        "sq-pressable grid min-h-13 min-w-13 place-items-center rounded-2xl border p-2",
        selected ? "border-volt-500 bg-volt-500/10" : "border-white/12",
        disabled && "cursor-not-allowed",
      )}
    >
      {children}
    </button>
  );
}
