"use client";

import { Volume2, VolumeX } from "lucide-react";

import { useAudio } from "@/hooks/use-audio";

/**
 * The one time SIDEQUEST asks about sound.
 *
 * ---
 *
 * ## Why it is a question and not a setting somebody has to find
 *
 * Browsers refuse to start audio outside a genuine user gesture, and that rule
 * is right: unexpected sound is an accessibility problem before it is an
 * annoyance, and a young person opening this in a classroom or on a bus has
 * every reason to want it quiet. So there is no autoplay, no silent-buffer
 * trick and no attempt to unlock on a scroll. The product asks once, plainly,
 * and takes the answer.
 *
 * ## Why it does not block
 *
 * It sits over the world rather than in front of it. Streets is already
 * running underneath, the player can ignore it entirely and walk away, and
 * choosing either option dismisses it forever. A modal here would put a
 * decision about decoration in front of a decision about whether to play at
 * all, which is the wrong order.
 *
 * ## Why "Keep it quiet" is a real answer
 *
 * It records `enabled: false` and the prompt never returns. Sound stays
 * reachable from the world menu and from Settings, so declining costs nothing
 * and is not punished by being asked again next visit. A prompt that reappears
 * is a prompt that was never really a question.
 */
export function SoundPrompt() {
  const audio = useAudio();

  /* Asked and answered, either way. */
  if (audio.prefs.enabled !== null) return null;

  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center px-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div
        role="group"
        aria-label="Sound"
        className="pointer-events-auto animate-rise flex items-center gap-2 rounded-2xl border border-white/12 bg-ink-900/92 px-2.5 py-2 backdrop-blur"
      >
        <p className="pl-1 text-xs font-semibold text-mist">Sound?</p>

        <button
          type="button"
          onClick={() => {
            /*
             * This click is the gesture. `enable` creates the context inside
             * the handler, which is the only place a browser will allow it.
             */
            void audio.enable();
          }}
          className="sq-pressable flex min-h-11 items-center gap-1.5 rounded-xl bg-volt-500 px-3 text-sm font-bold text-ink-900"
        >
          <Volume2 aria-hidden className="size-4" />
          Play with sound
        </button>

        <button
          type="button"
          onClick={audio.decline}
          className="sq-pressable flex min-h-11 items-center gap-1.5 rounded-xl border border-white/12 px-3 text-sm font-semibold text-mist"
        >
          <VolumeX aria-hidden className="size-4" />
          Keep it quiet
        </button>
      </div>
    </div>
  );
}
