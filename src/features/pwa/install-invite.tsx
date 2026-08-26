"use client";

import { Share, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useInstall } from "@/hooks/use-install";

/**
 * The install invitation.
 *
 * It appears once, after something has actually happened, and it names the
 * reason: the Campaign's follow-up chapters unlock on a delay, so there is
 * genuinely something to come back to. That is the only honest argument
 * SIDEQUEST has for installing, and if it were not true this component should
 * not exist.
 *
 * What it deliberately does not do:
 *
 *   - block anything. XP, rewards, the finale and both follow-ups work exactly
 *     the same for someone who dismisses it and never installs;
 *   - reappear. Dismissal is remembered on the device;
 *   - nag with urgency, a countdown, or a consequence for declining;
 *   - promise a notification. There is no push infrastructure, so the copy says
 *     the chapter will be waiting, not that the phone will buzz;
 *   - imitate a system dialog on a platform whose browser has no install API.
 */
export function InstallInvite({ eligible }: { eligible: boolean }) {
  const { ready, hidden, method, install, dismiss } = useInstall();

  if (!eligible || !ready || hidden) return null;

  return (
    <section
      aria-labelledby="install-invite-heading"
      className="relative mt-7 rounded-2xl border border-quest-500/25 bg-quest-500/8 p-4"
    >
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="sq-pressable absolute top-2 right-2 grid size-11 place-items-center rounded-full text-faint hover:text-mist"
      >
        <X aria-hidden className="size-4" />
      </button>

      <h2
        id="install-invite-heading"
        className="pr-10 font-display text-lg leading-tight font-extrabold text-chalk"
      >
        Keep SIDEQUEST
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-mist">
        Your next chapter unlocks later. Adding SIDEQUEST to your Home Screen makes it easy to come
        back to, and it keeps working in your browser either way.
      </p>

      {method === "prompt" && install ? (
        <Button variant="volt" size="md" className="mt-4" onClick={() => void install()}>
          Add to Home Screen
        </Button>
      ) : (
        /*
         * No `beforeinstallprompt` here, which on iOS means there is no API at
         * all. Describing the real Share menu step is the whole of what an
         * honest implementation can do.
         */
        <p className="mt-4 flex items-start gap-2.5 text-sm leading-relaxed text-muted">
          <Share aria-hidden className="mt-0.5 size-4 shrink-0 text-quest-300" />
          <span>
            Tap the Share button in your browser, then <strong className="text-mist">Add to
            Home Screen</strong>.
          </span>
        </p>
      )}
    </section>
  );
}
