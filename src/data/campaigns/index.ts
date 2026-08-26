import type { Campaign, CampaignChapter, CampaignFollowUp } from "@/types/campaign";
import type { Scenario } from "@/types/scenario";
import type { NormQuestion } from "@/data/norm-mirror";

import { ONE_BAD_MINUTE } from "./one-bad-minute";
import { QUICK_MONEY_SCENARIO } from "./scenarios/quick-money";
import { CAMPAIGN_NORM_SETS } from "./norm-questions";

/**
 * Campaign registry.
 *
 * Adding a second Campaign should be a matter of authoring one data file and
 * registering it here. No component in `src/features/campaigns` knows anything
 * about ONE BAD MINUTE specifically.
 */

export const CAMPAIGNS: Campaign[] = [ONE_BAD_MINUTE];

export const FLAGSHIP_CAMPAIGN_SLUG = ONE_BAD_MINUTE.slug;

export function getCampaign(slug: string): Campaign | undefined {
  return CAMPAIGNS.find((campaign) => campaign.slug === slug);
}

export function getCampaignById(id: string): Campaign | undefined {
  return CAMPAIGNS.find((campaign) => campaign.id === id);
}

export function getChapter(
  campaign: Campaign,
  chapterSlug: string,
): CampaignChapter | undefined {
  return campaign.chapters.find((chapter) => chapter.slug === chapterSlug);
}

export function getChapterById(
  campaign: Campaign,
  chapterId: string,
): CampaignChapter | undefined {
  return campaign.chapters.find((chapter) => chapter.id === chapterId);
}

export function getFollowUp(
  campaign: Campaign,
  followUpSlug: string,
): CampaignFollowUp | undefined {
  return campaign.followUps.find((followUp) => followUp.slug === followUpSlug);
}

/* -------------------------------------------------- Content resolution */

const CAMPAIGN_SCENARIOS: Record<string, Scenario> = {
  [QUICK_MONEY_SCENARIO.id]: QUICK_MONEY_SCENARIO,
};

export function getCampaignScenario(id: string): Scenario | undefined {
  return CAMPAIGN_SCENARIOS[id];
}

export function getCampaignNormQuestions(id: string): NormQuestion[] | undefined {
  return CAMPAIGN_NORM_SETS[id];
}

export { ONE_BAD_MINUTE };
