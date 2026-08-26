"use client";

import Link from "next/link";
import { Check, Clock, Lock, Mail } from "lucide-react";

import { cn } from "@/lib/cn";
import { ACCENT_TEXT } from "@/lib/accent";
import { useCampaign } from "./use-campaign";
import { useMounted } from "@/hooks/use-profile";
import { followUpLockLabel, hoursUntilFollowUp, isFollowUpUnlocked } from "@/lib/campaign";
import type { Campaign } from "@/types/campaign";

/**
 * Follow-ups.
 *
 * The strategically important part of Campaigns: the roadshow becomes episode
 * one instead of the whole thing. Unlocks are computed from elapsed time since
 * the Campaign was finished, with no push infrastructure and no backend, so
 * they work on a phone that never opens the app again until next Tuesday.
 */
export function FollowUpList({ campaign }: { campaign: Campaign }) {
  const { progress } = useCampaign(campaign);
  const mounted = useMounted();

  if (!progress) return null;

  const finished = Boolean(progress.completedAt);

  return (
    <section aria-labelledby="follow-ups">
      <h2 id="follow-ups" className="mb-1 text-lg font-bold tracking-tight text-chalk">
        After the event
      </h2>
      <p className="mb-3 text-sm text-muted">
        {finished
          ? "The story keeps going. These arrive on their own."
          : "Finish the Campaign and these open on their own, later."}
      </p>

      <ul className="space-y-2.5">
        {campaign.followUps.map((followUp) => {
          // Time-dependent, so it is computed after mount to keep the server
          // and the first client paint identical.
          const unlocked = mounted && isFollowUpUnlocked(progress, followUp);
          const done = progress.completedFollowUpIds.includes(followUp.id);
          const hours = mounted ? hoursUntilFollowUp(progress, followUp) : followUp.unlockAfterHours;

          const body = (
            <>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display text-base leading-tight font-bold text-chalk">
                    {followUp.title}
                  </p>
                  <p className="mt-0.5 text-sm leading-snug text-muted">{followUp.description}</p>
                </div>
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-xl",
                    done
                      ? "bg-volt-500/15 text-volt-300"
                      : unlocked
                        ? "bg-quest-500/15 text-quest-300"
                        : "bg-white/6 text-faint",
                  )}
                >
                  {done ? (
                    <Check aria-hidden className="size-4" strokeWidth={3} />
                  ) : unlocked ? (
                    <Mail aria-hidden className="size-4" />
                  ) : (
                    <Lock aria-hidden className="size-4" />
                  )}
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-3 text-xs font-semibold text-faint">
                <span className="inline-flex items-center gap-1">
                  <Clock aria-hidden className="size-3.5" />
                  {followUp.estimatedMinutes} min
                </span>
                <span className={ACCENT_TEXT[followUp.accent]}>{followUp.xp} XP</span>
                <span>
                  {done
                    ? "Completed"
                    : !finished
                      ? "After the Campaign"
                      : followUpLockLabel(hours)}
                </span>
              </div>
            </>
          );

          return (
            <li key={followUp.id}>
              {unlocked && !done ? (
                <Link
                  href={`/campaigns/${campaign.slug}/follow-up/${followUp.slug}`}
                  className="sq-card sq-pressable block p-4 hover:border-white/16"
                >
                  {body}
                </Link>
              ) : (
                <div className={cn("sq-card p-4", !unlocked && "opacity-70")}>{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
