"use client";

import { useCallback } from "react";

import { useAppStore } from "@/store/app-store";
import { useProfile } from "@/hooks/use-profile";
import type {
  Campaign,
  CampaignFollowUp,
  CampaignMode,
  ChapterResult,
} from "@/types/campaign";
import type { AwardResult } from "@/lib/xp";

/**
 * One hook for every Campaign surface.
 *
 * Components should never reach into the store directly for Campaign state.
 * Routing everything through here keeps the rule that a chapter is implicitly
 * started on arrival, which is what makes a cold QR scan work: a participant
 * who has never opened SIDEQUEST before lands on a chapter and it just runs.
 */
export function useCampaign(campaign: Campaign) {
  const { profile, ready } = useProfile();

  const startCampaign = useAppStore((state) => state.startCampaign);
  const setMode = useAppStore((state) => state.setCampaignMode);
  const unlockChapter = useAppStore((state) => state.unlockChapter);
  const completeChapterAction = useAppStore((state) => state.completeChapter);
  const completeFinaleAction = useAppStore((state) => state.completeFinale);
  const completeFollowUpAction = useAppStore((state) => state.completeFollowUp);

  const progress = profile.campaigns?.[campaign.id];

  /**
   * Starts the Campaign if it has not been started. Story mode is the default
   * because a QR scan has no opportunity to ask, and the mode can be changed
   * from the Campaign screen at any point.
   */
  const ensureStarted = useCallback(
    (mode: CampaignMode = "story") => {
      startCampaign(campaign, mode);
    },
    [campaign, startCampaign],
  );

  const unlock = useCallback(
    (chapterId: string) => unlockChapter(campaign.id, chapterId),
    [campaign.id, unlockChapter],
  );

  const completeChapter = useCallback(
    (chapterId: string, result: ChapterResult): AwardResult =>
      completeChapterAction(campaign, chapterId, result),
    [campaign, completeChapterAction],
  );

  const completeFinale = useCallback(
    (optionId: string): AwardResult => completeFinaleAction(campaign, optionId),
    [campaign, completeFinaleAction],
  );

  const completeFollowUp = useCallback(
    (followUp: CampaignFollowUp): AwardResult => completeFollowUpAction(campaign, followUp),
    [campaign, completeFollowUpAction],
  );

  const changeMode = useCallback(
    (mode: CampaignMode) => setMode(campaign.id, mode),
    [campaign.id, setMode],
  );

  return {
    ready,
    progress,
    ensureStarted,
    changeMode,
    unlock,
    completeChapter,
    completeFinale,
    completeFollowUp,
  };
}
