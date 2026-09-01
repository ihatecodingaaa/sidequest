import type { Crew } from "@/types/social";

/**
 * Seeded crews.
 *
 * Crews are asynchronous by design for the prototype: there is no realtime
 * layer, no invites and no server. A crew is a shared goal and a weekly board,
 * which is enough to create the social pull without a multiplayer backend.
 */

export const CREWS: Crew[] = [
  {
    id: "crew-clubhouse",
    name: "Mickey's Clubhouse",
    tag: "Tampines",
    joinCode: "CLUB-482",
    weeklyXp: 1180,
    rank: 2,
    members: [
      { id: "m-you", name: "You", initials: "YO", weeklyXp: 260, accent: "quest", isYou: true },
      { id: "m-rina", name: "Rina", initials: "RN", weeklyXp: 310, accent: "coral" },
      { id: "m-dan", name: "Danish", initials: "DN", weeklyXp: 245, accent: "volt" },
      { id: "m-jc", name: "Jia Cheng", initials: "JC", weeklyXp: 205, accent: "pulse" },
      { id: "m-ash", name: "Ashwin", initials: "AS", weeklyXp: 160, accent: "gold" },
    ],
    currentChallenge: {
      title: "Everyone runs BREAKSAFE",
      detail: "Five members, five different patches. Compare what each of you chose to fix.",
      target: 5,
      progress: 3,
      missionId: "mission-breaksafe",
    },
    recentAchievements: [
      { label: "Rina finished REWIND", when: "Yesterday" },
      { label: "Crew cleared the Scam Relay", when: "2 days ago" },
      { label: "Danish submitted a Build Quest", when: "4 days ago" },
    ],
  },
  {
    id: "crew-northline",
    name: "Northline",
    tag: "Yishun",
    joinCode: "NRTH-118",
    weeklyXp: 1345,
    rank: 1,
    members: [
      { id: "n-1", name: "Kaiwen", initials: "KW", weeklyXp: 390, accent: "quest" },
      { id: "n-2", name: "Sara", initials: "SR", weeklyXp: 355, accent: "pulse" },
      { id: "n-3", name: "Marcus", initials: "MC", weeklyXp: 320, accent: "volt" },
      { id: "n-4", name: "Priya", initials: "PR", weeklyXp: 280, accent: "gold" },
    ],
    currentChallenge: {
      title: "Field Quest week",
      detail: "Three check-ins across three different areas.",
      target: 3,
      progress: 2,
      missionId: "mission-field-design-hunt",
    },
    recentAchievements: [{ label: "Held rank 1 for 2 weeks", when: "This week" }],
  },
  {
    id: "crew-southbound",
    name: "Southbound",
    tag: "Clementi",
    joinCode: "STHB-907",
    weeklyXp: 960,
    rank: 3,
    members: [
      { id: "s-1", name: "Ilyas", initials: "IL", weeklyXp: 300, accent: "coral" },
      { id: "s-2", name: "Wen Xin", initials: "WX", weeklyXp: 270, accent: "quest" },
      { id: "s-3", name: "Tasha", initials: "TS", weeklyXp: 220, accent: "volt" },
      { id: "s-4", name: "Ben", initials: "BN", weeklyXp: 170, accent: "pulse" },
    ],
    currentChallenge: {
      title: "Norm Mirror, all five questions",
      detail: "Everyone predicts first, then compares against the crew.",
      target: 4,
      progress: 4,
      missionId: "mission-norm-mirror",
    },
    recentAchievements: [{ label: "Completed a crew challenge", when: "3 days ago" }],
  },
];

export const DEFAULT_CREW_ID = "crew-clubhouse";

/*
 * The cross-crew league table is gone.
 *
 * It ranked three crews by a fabricated weekly total, on the screen whose
 * whole argument is that a group sets its own norm rather than competing
 * inside or against one. It also could not have been made honest: there is no
 * account system, so every number in it was invented, and a league table of
 * invented numbers is the clearest possible version of the thing the data
 * honesty rules exist to prevent.
 *
 * `LeaderboardEntry` stays in the types for now because nothing else has
 * claimed the shape, and removing it would be a rename rather than a decision.
 */

export function getCrew(id: string | null | undefined): Crew | undefined {
  if (!id) return undefined;
  return CREWS.find((crew) => crew.id === id);
}

export function findCrewByJoinCode(code: string): Crew | undefined {
  const normalised = code.trim().toUpperCase();
  return CREWS.find((crew) => crew.joinCode.toUpperCase() === normalised);
}
