"use client";

import { useState } from "react";
import { Check, Info, Lock, X } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_TEXT } from "@/lib/accent";
import { formatXp } from "@/lib/format";
import { REWARDS } from "@/data/rewards";
import { ProvenanceTag } from "@/components/ui/primitives";
import { useAppStore } from "@/store/app-store";
import { useProfile } from "@/hooks/use-profile";
import { WorldSheet } from "@/features/streets/components/world-sheet";

/**
 * The rewards counter, inside the kopitiam.
 *
 * This is an experiential shell over the reward logic that already exists. It
 * calls the same `claimReward` in the store, obeys the same thresholds, writes
 * the same Safety Passport entry and shows the same honest footnotes. Nothing
 * about the economy changed to make a room for it.
 *
 * That is deliberate, and it is the most important decision in this feature.
 * SIDEQUEST's XP is a **threshold, not a balance**: reaching a number unlocks
 * recognition and nothing is ever deducted. The obvious version of an in-world
 * shop would have made XP spendable, and that one change would have turned
 * every scenario into an obstacle between a player and a number. Walking to a
 * counter to claim something you already qualify for is more memorable than
 * tapping a row on a settings screen, and it changes nothing about what is
 * granted or how.
 *
 * So: no currency, no stock pressure, no timers, no bundles, no randomised
 * anything.
 */
export function RewardsCounter({
  onClose,
  landscape,
}: {
  onClose: () => void;
  landscape: boolean;
}) {
  const { profile, ready } = useProfile();
  const claimReward = useAppStore((state) => state.claimReward);
  const [justClaimed, setJustClaimed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const xp = ready ? profile.xp : 0;
  const claimed = new Set((profile.rewardClaims ?? []).map((entry) => entry.rewardId));

  const claim = (rewardId: string) => {
    const outcome = claimReward(rewardId);
    if (outcome.ok) {
      setJustClaimed(rewardId);
      setError(null);
    } else {
      setError(outcome.reason ?? "Could not claim this.");
    }
  };

  return (
    <WorldSheet
      label="Rewards counter"
      landscape={landscape}
      onClose={onClose}
      closeLabel="Leave the counter"
    >
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold tracking-[0.1em] text-gold-400 uppercase">
              Rewards counter
            </p>
            <h2 className="mt-1 font-display text-xl font-extrabold tracking-tight text-chalk">
              {formatXp(xp)} XP earned
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted">
              XP is a threshold, never a balance. Claiming costs you nothing and takes nothing away.
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

        {/*
          Provenance at the top of a dense list rather than on every row. The
          rule is per claim and per screen, and this screen makes one claim
          about all of it.
        */}
        <div className="mt-4 flex gap-3 rounded-2xl border border-gold-500/25 bg-gold-500/8 p-3.5">
          <Info aria-hidden className="mt-0.5 size-4 shrink-0 text-gold-400" />
          <div className="min-w-0">
            <ProvenanceTag provenance="partner-concept" compact />
            <p className="mt-1.5 text-xs leading-relaxed text-mist">
              This counter is a concept for how a neighbourhood shop could honour a SIDEQUEST
              reward. No retailer, brand or organisation has agreed to any of it, claiming issues no
              code, and nothing here has monetary value.
            </p>
          </div>
        </div>

        {error ? (
          <p
            role="alert"
            className="mt-4 rounded-2xl border border-coral-500/30 bg-coral-500/10 p-3.5 text-sm text-coral-300"
          >
            {error}
          </p>
        ) : null}

        <ul className="mt-4 space-y-2.5">
          {REWARDS.map((reward) => {
            const isClaimed = claimed.has(reward.id) || justClaimed === reward.id;
            const short = reward.xpCost - xp;
            const locked = !isClaimed && short > 0;

            return (
              <li
                key={reward.id}
                className={cn(
                  "rounded-2xl border p-3.5",
                  isClaimed
                    ? "border-volt-500/30 bg-volt-500/8"
                    : locked
                      ? "border-white/8 bg-white/2"
                      : "border-white/14 bg-white/5",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-chalk">{reward.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">
                      {reward.description}
                    </p>
                    {reward.potentialPartner ? (
                      <p className="mt-1.5 text-xs text-faint">
                        Potential partner: {reward.potentialPartner}. Not confirmed.
                      </p>
                    ) : null}
                  </div>
                  <span
                    className={cn(
                      "shrink-0 text-sm font-extrabold tabular-nums",
                      ACCENT_TEXT[reward.accent],
                    )}
                  >
                    {formatXp(reward.xpCost)} XP
                  </span>
                </div>

                <div className="mt-3">
                  {isClaimed ? (
                    <p className="inline-flex items-center gap-2 rounded-full bg-volt-500/12 px-3.5 py-1.5 text-sm font-bold text-volt-300">
                      <Check aria-hidden className="size-4" strokeWidth={3} />
                      Claimed. Recorded in your Safety Passport.
                    </p>
                  ) : locked ? (
                    <p className="inline-flex items-center gap-2 text-xs font-semibold text-faint">
                      <Lock aria-hidden className="size-3.5" />
                      {formatXp(short)} XP to go
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => claim(reward.id)}
                      className="sq-pressable flex min-h-11 w-full items-center justify-center rounded-xl bg-volt-500 px-4 text-sm font-bold text-ink-900"
                    >
                      Claim at the counter
                    </button>
                  )}
                </div>

                {isClaimed ? (
                  <p className="mt-2.5 text-xs leading-relaxed text-faint">{reward.footnote}</p>
                ) : null}
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          onClick={onClose}
          className="sq-pressable mt-5 flex min-h-12 w-full items-center justify-center rounded-2xl border border-white/10 bg-white/4 text-sm font-semibold text-mist"
        >
          Back to the block
        </button>
    </WorldSheet>
  );
}
