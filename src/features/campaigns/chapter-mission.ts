import type { Campaign, CampaignChapter, CampaignFollowUp } from "@/types/campaign";
import type { Mission } from "@/types/mission";

/**
 * Adapts a Campaign chapter to the `Mission` shape the existing players read.
 *
 * The players only ever use a handful of fields from a Mission: the title and
 * accent for the shell, and the XP and skill rewards for the completion
 * screen. Building this adapter is what lets REWIND, Norm Mirror and BREAKSAFE
 * be driven by a chapter without any of them learning what a Campaign is.
 *
 * The id is namespaced so it can never collide with a catalogue mission. XP is
 * not awarded through this object anyway: the Campaign host does that against
 * its own ledger.
 */
export function chapterAsMission(campaign: Campaign, chapter: CampaignChapter): Mission {
  return {
    id: `campaign:${campaign.id}:${chapter.id}`,
    title: chapter.title,
    subtitle: `Chapter ${chapter.chapterNumber}`,
    description: chapter.shortDescription,
    missionType: "quick",
    playMode: chapter.config.mechanic === "crew-shift" ? "crew" : "solo",
    crewSize: chapter.config.mechanic === "crew-shift" ? "2-4" : undefined,
    player: "scenario",
    durationMinutes: chapter.estimatedMinutes,
    xp: chapter.xp,
    difficulty: "core",
    ageBands: campaign.ageBands,
    categories: campaign.categories,
    skillRewards: chapter.skillRewards,
    behaviouralHook: chapter.behaviouralMechanism,
    accent: chapter.accent,
    status: "available",
    provenance: campaign.provenance,
  };
}

export function followUpAsMission(
  campaign: Campaign,
  followUp: CampaignFollowUp,
): Mission {
  return {
    id: `campaign:${campaign.id}:${followUp.id}`,
    title: followUp.title,
    subtitle: "Follow-up",
    description: followUp.description,
    missionType: "quick",
    playMode: "solo",
    player: "scenario",
    durationMinutes: followUp.estimatedMinutes,
    xp: followUp.xp,
    difficulty: "starter",
    ageBands: campaign.ageBands,
    categories: campaign.categories,
    skillRewards: followUp.skillRewards,
    behaviouralHook: followUp.behaviouralMechanism,
    accent: followUp.accent,
    status: "available",
    provenance: campaign.provenance,
  };
}
