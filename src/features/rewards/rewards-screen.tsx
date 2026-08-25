"use client";

import { useState } from "react";
import { Check, Gift, Info, Lock } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_BG_SOFT, ACCENT_TEXT } from "@/lib/accent";
import { formatXp } from "@/lib/format";
import { REWARDS } from "@/data/rewards";
import { PageHeader } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { ProgressBar, ProvenanceTag } from "@/components/ui/primitives";
import { useAppStore } from "@/store/app-store";
import { useProfile } from "@/hooks/use-profile";

const INVENTORY_COPY = {
  available: "Available",
  limited: "Limited",
  waitlist: "Waitlist",
} as const;

export function RewardsScreen() {
  const { profile, ready } = useProfile();
  const claimReward = useAppStore((state) => state.claimReward);
  const [justClaimed, setJustClaimed] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
    <div>
      <PageHeader
        eyebrow="You"
        title="Rewards"
        lede="Recognition first, then experiences, then things a sponsor would realistically fund."
      />

      <div className="sq-card mb-5 flex gap-3 p-4">
        <Info aria-hidden className="mt-0.5 size-5 shrink-0 text-gold-400" />
        <p className="text-sm leading-relaxed text-mist">
          Everything below marked as a partner concept is a proposal. No retailer, brand or
          organisation has agreed to fund any of it, and claiming in this prototype issues no code
          and carries no monetary value.
        </p>
      </div>

      {error ? (
        <p role="alert" className="mb-4 rounded-2xl border border-coral-500/30 bg-coral-500/10 p-3.5 text-sm text-coral-300">
          {error}
        </p>
      ) : null}

      <ul className="grid gap-3 lg:grid-cols-2">
        {REWARDS.map((reward) => {
          const claimed =
            ready && profile.rewardClaims.some((entry) => entry.rewardId === reward.id);
          const affordable = ready && profile.xp >= reward.xpCost;
          const showJustClaimed = justClaimed === reward.id;

          return (
            <li key={reward.id} className="sq-card flex flex-col p-4">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "grid size-11 shrink-0 place-items-center rounded-2xl",
                    ACCENT_BG_SOFT[reward.accent],
                  )}
                >
                  <Gift aria-hidden className={cn("size-5", ACCENT_TEXT[reward.accent])} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <ProvenanceTag provenance={reward.provenance} compact />
                    <span className="rounded-full bg-white/6 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-faint">
                      {INVENTORY_COPY[reward.inventoryStatus]}
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-base leading-tight font-bold text-chalk">
                    {reward.title}
                  </h2>
                  <p className="mt-1 text-sm leading-snug text-muted">{reward.description}</p>
                  {reward.potentialPartner ? (
                    <p className="mt-1.5 text-xs text-faint">
                      Potential partner: {reward.potentialPartner}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="mt-4 flex-1">
                <div className="flex items-baseline justify-between">
                  <span className={cn("font-display text-lg font-extrabold tabular-nums", ACCENT_TEXT[reward.accent])}>
                    {formatXp(reward.xpCost)} XP
                  </span>
                  {!affordable && ready ? (
                    <span className="text-xs font-semibold text-faint tabular-nums">
                      {formatXp(reward.xpCost - profile.xp)} to go
                    </span>
                  ) : null}
                </div>
                <ProgressBar
                  className="mt-2"
                  accent={reward.accent}
                  value={ready ? Math.min(1, profile.xp / reward.xpCost) : 0}
                  label={`Progress towards ${reward.title}`}
                />
              </div>

              <div className="mt-4">
                {claimed ? (
                  <div className="rounded-2xl border border-volt-500/30 bg-volt-500/8 p-3.5">
                    <p className="flex items-center gap-2 text-sm font-bold text-volt-300">
                      <Check aria-hidden className="size-4" strokeWidth={3} />
                      {showJustClaimed ? "Prototype reward claimed" : "Claimed"}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-mist">{reward.footnote}</p>
                  </div>
                ) : (
                  <Button
                    variant={affordable ? "volt" : "secondary"}
                    full
                    disabled={!affordable}
                    onClick={() => claim(reward.id)}
                  >
                    {affordable ? (
                      "Claim"
                    ) : (
                      <>
                        <Lock aria-hidden className="size-4" />
                        Locked
                      </>
                    )}
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      <section className="sq-card mt-7 p-5">
        <h2 className="font-display text-base font-bold text-chalk">Why the list is ordered this way</h2>
        <p className="mt-2 text-sm leading-relaxed text-mist">
          The cheapest rewards are the non-commercial ones. That is deliberate: if the fastest route
          to a voucher is clicking through content, the product becomes a voucher farm and the
          prevention value disappears. Vouchers sit at the top of the curve, where they supplement
          progress rather than drive it.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-mist">
          Claiming never spends your XP. Progress is a record of what you have done, and taking a
          reward should not erase it.
        </p>
      </section>
    </div>
  );
}
