"use client";

import { Music, Volume2, VolumeX, Waves, Zap } from "lucide-react";

import { cn } from "@/lib/cn";
import { useAudio } from "@/hooks/use-audio";

/**
 * The sound controls, in one component used in two places.
 *
 * ---
 *
 * ## Why three switches and not one
 *
 * Because they fail differently. The effects are feedback and somebody may
 * want them with everything else off; the music is atmosphere and is the first
 * thing to go in a shared room; the ambience is the layer most likely to be
 * mistaken for a fault on a bad speaker. The game accessibility guidelines ask
 * for separate control of the audio categories for exactly this reason, and a
 * facilitator running a session in a classroom needs to kill the music and
 * keep the feedback.
 *
 * ## Why a master switch as well
 *
 * WCAG 2.2 success criterion 1.4.2 requires a mechanism to stop or control
 * audio that plays automatically for more than three seconds. Nothing here
 * plays without a gesture, so the criterion is not triggered, but a single
 * obvious control that stops everything is the right answer regardless: a
 * person who needs silence right now should not have to find three toggles.
 *
 * ## Nothing here changes what the product can do
 *
 * Every cue accompanies something already on screen, so turning all of this
 * off changes how SIDEQUEST feels and nothing about what it says. That is the
 * rule the whole audio layer is built to keep, and it is why these switches
 * are a preference rather than a difficulty setting.
 */
export function AudioControls({ className }: { className?: string }) {
  const audio = useAudio();
  const { prefs } = audio;

  const rows = [
    {
      id: "sfx" as const,
      label: "Sound effects",
      hint: "Footsteps, doors, choices",
      icon: Zap,
      on: prefs.sfx,
    },
    {
      id: "music" as const,
      label: "Music",
      hint: "The district loop",
      icon: Music,
      on: prefs.music,
    },
    {
      id: "ambience" as const,
      label: "Ambience",
      hint: "Birds, traffic, the court",
      icon: Waves,
      on: prefs.ambience,
    },
  ];

  return (
    <div className={cn("space-y-2", className)}>
      {/*
        Turning sound on is a gesture, so this is a real button rather than a
        switch that quietly does nothing. Browsers refuse to start an audio
        context outside a click, and pretending otherwise would leave somebody
        looking at a toggle that says on next to silence.
      */}
      {prefs.enabled !== true ? (
        <button
          type="button"
          onClick={() => void audio.enable()}
          className="sq-pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-volt-500 text-sm font-bold text-ink-900"
        >
          <Volume2 aria-hidden className="size-4" />
          Turn sound on
        </button>
      ) : (
        <button
          type="button"
          onClick={audio.decline}
          className="sq-pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-white/12 text-sm font-semibold text-mist"
        >
          <VolumeX aria-hidden className="size-4" />
          Turn sound off
        </button>
      )}

      {rows.map((row) => {
        const Icon = row.icon;
        const live = prefs.enabled === true;
        return (
          <button
            key={row.id}
            type="button"
            role="switch"
            aria-checked={row.on}
            disabled={!live}
            onClick={() => audio.setBus(row.id, !row.on)}
            className={cn(
              "sq-pressable flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left",
              live
                ? "border-white/10 bg-white/4 hover:bg-white/7"
                : "cursor-not-allowed border-white/8 bg-white/2 opacity-55",
            )}
          >
            <Icon
              aria-hidden
              className={cn("size-5 shrink-0", row.on && live ? "text-volt-300" : "text-faint")}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-chalk">{row.label}</span>
              <span className="block text-xs text-muted">{row.hint}</span>
            </span>
            {/*
              State by shape and position as well as colour: the knob moves.
              Colour alone would fail the same rule the world's Signal markers
              follow, and for the same people.
            */}
            <span
              aria-hidden
              className={cn(
                "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                row.on && live ? "bg-volt-500" : "bg-white/15",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 size-5 rounded-full bg-ink-900 transition-[left]",
                  row.on && live ? "left-[1.375rem]" : "left-0.5",
                )}
              />
            </span>
          </button>
        );
      })}

      <p className="px-1 pt-1 text-xs leading-relaxed text-faint">
        Sound is decoration. Everything SIDEQUEST tells you is on the screen too, so nothing is
        missed with it off.
      </p>
    </div>
  );
}
