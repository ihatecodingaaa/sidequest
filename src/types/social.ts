export interface CrewMember {
  id: string;
  name: string;
  initials: string;
  weeklyXp: number;
  accent: "quest" | "pulse" | "volt" | "coral" | "gold";
  isYou?: boolean;
}

export interface Crew {
  id: string;
  name: string;
  tag: string;
  joinCode: string;
  members: CrewMember[];
  weeklyXp: number;
  rank: number;
  currentChallenge: {
    title: string;
    detail: string;
    target: number;
    progress: number;
    missionId?: string;
  };
  recentAchievements: { label: string; when: string }[];
}

export interface LeaderboardEntry {
  crewId: string;
  name: string;
  weeklyXp: number;
  rank: number;
}
