"use client";

import { create } from "zustand";
import { unlockedEchoStyles, type EchoStyleId } from "@/data/echo-styles";
import { createJSONStorage, persist } from "zustand/middleware";

import type { AgeBand, Interest, SkillId } from "@/types/core";
import type { PartnerSubmission, RewardClaim, UserProfile } from "@/types/profile";
import { awardMission, type AwardResult } from "@/lib/xp";
import { getMission } from "@/data/missions";
import { getReward } from "@/data/rewards";
import { DEFAULT_CREW_ID } from "@/data/crews";
import { sanitiseText } from "@/lib/format";
import type {
  Campaign,
  CampaignFollowUp,
  CampaignMode,
  CampaignProgress,
  ChapterResult,
} from "@/types/campaign";
import * as campaignSlice from "./campaign-slice";
import { readOrCreateSeed } from "@/lib/campaign";

export const STORAGE_KEY = "sidequest.profile.v1";

export const EMPTY_PROFILE: UserProfile = {
  displayName: "",
  ageBand: "16-18",
  interests: [],
  neighbourhood: null,
  xp: 0,
  streakDays: 0,
  completedMissionIds: [],
  savedPulseIds: [],
  crewId: null,
  skillPoints: {},
  submissions: [],
  rewardClaims: [],
  onboardedAt: null,
  campaigns: {},
};

/**
 * Populated state used by "Load demo progress".
 *
 * It exists so a judge can see the Safety Passport and the reward store with
 * something in them without playing every mission first. It is deterministic:
 * the same button always produces exactly this state, which is what makes the
 * demo repeatable between judges.
 */
export const DEMO_PROGRESS: Partial<UserProfile> = {
  xp: 415,
  streakDays: 4,
  completedMissionIds: ["mission-otp", "mission-marketplace", "mission-crew-relay"],
  savedPulseIds: ["pulse-job-scams", "pulse-selfcheckout"],
  skillPoints: {
    "scam-awareness": 52,
    "decision-making": 30,
    communication: 24,
    "peer-intervention": 8,
  },
};

interface OnboardingPayload {
  displayName: string;
  ageBand: AgeBand;
  interests: Interest[];
  neighbourhood: string | null;
}

interface AppState {
  profile: UserProfile;
  hasHydrated: boolean;

  setHasHydrated: (value: boolean) => void;
  completeOnboarding: (payload: OnboardingPayload) => void;

  /** Idempotent. Returns whether XP was actually granted. */
  completeMission: (missionId: string) => AwardResult;
  isMissionComplete: (missionId: string) => boolean;

  toggleSavedPulse: (pulseId: string) => void;
  setNeighbourhood: (area: string | null) => void;
  /** Cosmetic only. Refuses a style the profile has not earned. */
  setEchoStyle: (styleId: EchoStyleId) => void;
  setInterests: (interests: Interest[]) => void;
  setAgeBand: (ageBand: AgeBand) => void;
  setDisplayName: (name: string) => void;

  joinCrew: (crewId: string) => void;
  leaveCrew: () => void;

  claimReward: (rewardId: string) => { ok: boolean; reason?: string };
  addSubmission: (submission: Omit<PartnerSubmission, "id" | "submittedAt">) => PartnerSubmission;

  loadDemoProgress: () => void;
  resetDemo: () => void;

  /* ----------------------------------------------------------- Campaigns */

  startCampaign: (campaign: Campaign, mode: CampaignMode) => void;
  setCampaignMode: (campaignId: string, mode: CampaignMode) => void;
  getCampaignProgress: (campaignId: string) => CampaignProgress | undefined;
  unlockChapter: (campaignId: string, chapterId: string) => void;
  completeChapter: (
    campaign: Campaign,
    chapterId: string,
    result: ChapterResult,
  ) => AwardResult;
  completeFinale: (campaign: Campaign, optionId: string) => AwardResult;
  completeFollowUp: (campaign: Campaign, followUp: CampaignFollowUp) => AwardResult;

  resetCampaign: (campaignId: string) => void;
  reassignCampaignRoute: (campaign: Campaign) => void;
  unlockAllChapters: (campaign: Campaign) => void;
  advanceCampaignClock: (campaignId: string, hours: number) => void;
}

function makeId(prefix: string): string {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: EMPTY_PROFILE,
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      completeOnboarding: (payload) =>
        set((state) => ({
          profile: {
            ...state.profile,
            displayName: sanitiseText(payload.displayName, 24),
            ageBand: payload.ageBand,
            interests: payload.interests,
            neighbourhood: payload.neighbourhood,
            // The prototype crew is joined up front so the social layer is
            // visible from the first screen without a fake invite flow.
            crewId: state.profile.crewId ?? DEFAULT_CREW_ID,
            streakDays: Math.max(1, state.profile.streakDays),
            onboardedAt: new Date().toISOString(),
          },
        })),

      completeMission: (missionId) => {
        const mission = getMission(missionId);
        const { profile } = get();

        if (!mission) {
          return {
            xp: profile.xp,
            completedMissionIds: profile.completedMissionIds,
            skillPoints: profile.skillPoints,
            awarded: false,
            xpGained: 0,
            leveledUp: false,
            levelBefore: 1,
            levelAfter: 1,
          };
        }

        const result = awardMission(
          {
            xp: profile.xp,
            completedMissionIds: profile.completedMissionIds,
            skillPoints: profile.skillPoints,
          },
          mission,
        );

        if (result.awarded) {
          set({
            profile: {
              ...profile,
              xp: result.xp,
              completedMissionIds: result.completedMissionIds,
              skillPoints: result.skillPoints,
            },
          });
        }

        return result;
      },

      isMissionComplete: (missionId) => get().profile.completedMissionIds.includes(missionId),

      toggleSavedPulse: (pulseId) =>
        set((state) => {
          const saved = state.profile.savedPulseIds;
          return {
            profile: {
              ...state.profile,
              savedPulseIds: saved.includes(pulseId)
                ? saved.filter((id) => id !== pulseId)
                : [...saved, pulseId],
            },
          };
        }),

      setNeighbourhood: (area) =>
        set((state) => ({ profile: { ...state.profile, neighbourhood: area } })),

      /*
       * The guard is the point. Availability is derived from progress, so the
       * only way a locked style could ever be selected is a bug or a hand-edited
       * localStorage, and in both cases the right answer is to ignore it rather
       * than to persist a claim the profile did not earn.
       */
      setEchoStyle: (styleId) =>
        set((state) =>
          unlockedEchoStyles(state.profile).has(styleId)
            ? { profile: { ...state.profile, echoStyleId: styleId } }
            : state,
        ),

      setInterests: (interests) =>
        set((state) => ({ profile: { ...state.profile, interests } })),

      setAgeBand: (ageBand) => set((state) => ({ profile: { ...state.profile, ageBand } })),

      setDisplayName: (name) =>
        set((state) => ({ profile: { ...state.profile, displayName: sanitiseText(name, 24) } })),

      joinCrew: (crewId) => set((state) => ({ profile: { ...state.profile, crewId } })),

      leaveCrew: () => set((state) => ({ profile: { ...state.profile, crewId: null } })),

      claimReward: (rewardId) => {
        const reward = getReward(rewardId);
        const { profile } = get();
        if (!reward) return { ok: false, reason: "Unknown reward." };
        if (profile.rewardClaims.some((claim) => claim.rewardId === rewardId)) {
          return { ok: false, reason: "Already claimed." };
        }
        if (profile.xp < reward.xpCost) {
          return { ok: false, reason: "Not enough XP yet." };
        }

        // Claiming records recognition. It never spends XP and never issues a
        // code with monetary value: this is a prototype, and the copy says so.
        const claim: RewardClaim = {
          rewardId,
          claimedAt: new Date().toISOString(),
          reference: makeId("proto"),
        };

        set({ profile: { ...profile, rewardClaims: [...profile.rewardClaims, claim] } });
        return { ok: true };
      },

      addSubmission: (submission) => {
        const record: PartnerSubmission = {
          ...submission,
          title: sanitiseText(submission.title, 90),
          solution: sanitiseText(submission.solution, 600),
          id: makeId("sub"),
          submittedAt: new Date().toISOString(),
        };
        set((state) => ({
          profile: { ...state.profile, submissions: [record, ...state.profile.submissions] },
        }));
        return record;
      },

      loadDemoProgress: () =>
        set((state) => ({
          profile: {
            ...state.profile,
            ...DEMO_PROGRESS,
            crewId: state.profile.crewId ?? DEFAULT_CREW_ID,
            onboardedAt: state.profile.onboardedAt ?? new Date().toISOString(),
            displayName: state.profile.displayName || "Lucas",
            neighbourhood: state.profile.neighbourhood ?? "Tampines",
          } as UserProfile,
        })),

      resetDemo: () => set({ profile: EMPTY_PROFILE }),

      /* --------------------------------------------------------- Campaigns */

      startCampaign: (campaign, mode) =>
        set((state) => ({
          profile: campaignSlice.startCampaign(
            state.profile,
            campaign,
            mode,
            readOrCreateSeed(),
          ),
        })),

      setCampaignMode: (campaignId, mode) =>
        set((state) => ({
          profile: campaignSlice.setCampaignMode(state.profile, campaignId, mode),
        })),

      getCampaignProgress: (campaignId) =>
        campaignSlice.getProgress(get().profile, campaignId),

      unlockChapter: (campaignId, chapterId) =>
        set((state) => ({
          profile: campaignSlice.unlockChapter(state.profile, campaignId, chapterId),
        })),

      completeChapter: (campaign, chapterId, result) => {
        const mutation = campaignSlice.completeChapter(
          get().profile,
          campaign,
          chapterId,
          result,
        );
        set({ profile: mutation.profile });
        return mutation.result;
      },

      completeFinale: (campaign, optionId) => {
        const mutation = campaignSlice.completeFinale(get().profile, campaign, optionId);
        set({ profile: mutation.profile });
        return mutation.result;
      },

      completeFollowUp: (campaign, followUp) => {
        const mutation = campaignSlice.completeFollowUp(get().profile, campaign, followUp);
        set({ profile: mutation.profile });
        return mutation.result;
      },

      resetCampaign: (campaignId) =>
        set((state) => ({
          profile: campaignSlice.resetCampaign(state.profile, campaignId),
        })),

      reassignCampaignRoute: (campaign) =>
        set((state) => ({
          // A fresh seed on purpose: the point of this control is to show a
          // different route without clearing the participant's progress.
          profile: campaignSlice.reassignRoute(
            state.profile,
            campaign,
            Math.random().toString(36).slice(2, 12),
          ),
        })),

      unlockAllChapters: (campaign) =>
        set((state) => ({
          profile: campaignSlice.unlockAllChapters(state.profile, campaign),
        })),

      advanceCampaignClock: (campaignId, hours) =>
        set((state) => ({
          profile: campaignSlice.advanceDemoClock(state.profile, campaignId, hours),
        })),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ profile: state.profile }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

/** Total points across every skill, used for the passport summary. */
export function totalSkillPoints(skillPoints: Partial<Record<SkillId, number>>): number {
  return Object.values(skillPoints).reduce<number>((sum, value) => sum + (value ?? 0), 0);
}
