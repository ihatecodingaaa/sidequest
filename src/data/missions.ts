import type { Mission, MissionType } from "@/types/mission";

/**
 * The mission catalogue.
 *
 * `player` decides which experience mounts. Three hero missions have bespoke
 * players; the rest run on the shared data-driven scenario engine so new
 * content is a data change rather than a code change.
 */

export const MISSIONS: Mission[] = [
  {
    id: "mission-otp",
    title: "Would you send the OTP?",
    subtitle: "Two minutes, one decision",
    description:
      "A call, a code and thirty seconds of pressure. The quickest way to find out whether you would hold the line.",
    missionType: "quick",
    player: "scenario",
    durationMinutes: 2,
    xp: 40,
    difficulty: "starter",
    ageBands: ["13-15", "16-18", "19-25", "26+"],
    categories: ["scams", "cyber"],
    skillRewards: [
      { skillId: "scam-awareness", points: 18 },
      { skillId: "decision-making", points: 10 },
    ],
    behaviouralHook: "Rehearses a refusal so it is available under time pressure.",
    accent: "gold",
    status: "available",
    provenance: "seeded",
    relatedPulseItemIds: ["pulse-otp", "pulse-deepfake"],
  },
  {
    id: "mission-job-scam",
    title: "$400 a day, work from home",
    subtitle: "The offer that arrives in your DMs",
    description:
      "A recruiter with no company, a job with no interview and a first payment that actually lands. Work out where this is going before your bank account does.",
    missionType: "quick",
    player: "scenario",
    durationMinutes: 2,
    xp: 60,
    difficulty: "starter",
    ageBands: ["16-18", "19-25", "26+"],
    categories: ["scams", "youth"],
    skillRewards: [
      { skillId: "scam-awareness", points: 22 },
      { skillId: "decision-making", points: 12 },
    ],
    behaviouralHook:
      "Separates an immediate reward from a delayed consequence, which is the exact gap job scams exploit.",
    accent: "quest",
    status: "available",
    provenance: "seeded",
    relatedPulseItemIds: ["pulse-job-scams"],
  },
  {
    id: "mission-marketplace",
    title: "Two tickets, one very keen seller",
    subtitle: "Why they always want to leave the app",
    description:
      "The listing is fine. The chat is where it goes wrong. Practise noticing the moment your protection disappears.",
    missionType: "quick",
    player: "scenario",
    durationMinutes: 3,
    xp: 55,
    difficulty: "core",
    ageBands: ["13-15", "16-18", "19-25", "26+"],
    categories: ["scams", "cyber"],
    skillRewards: [
      { skillId: "scam-awareness", points: 20 },
      { skillId: "decision-making", points: 8 },
    ],
    behaviouralHook: "Trains attention on the switch of channel rather than the content of the offer.",
    accent: "pulse",
    status: "available",
    provenance: "seeded",
    relatedPulseItemIds: ["pulse-marketplace"],
  },
  {
    id: "mission-rewind",
    title: "REWIND",
    subtitle: "The five minutes you would take back",
    description:
      "Play a night out with your friends the way it actually happens. Then go back to the one moment where a sentence would have changed everything.",
    missionType: "quick",
    player: "rewind",
    durationMinutes: 6,
    xp: 120,
    difficulty: "core",
    ageBands: ["13-15", "16-18", "19-25"],
    categories: ["youth", "safety"],
    skillRewards: [
      { skillId: "peer-intervention", points: 30 },
      { skillId: "decision-making", points: 20 },
      { skillId: "communication", points: 12 },
    ],
    behaviouralHook:
      "Decision rehearsal. Replaying the pivot with an alternative response builds a script that is available in the real moment.",
    accent: "coral",
    status: "available",
    provenance: "seeded",
    relatedPulseItemIds: ["pulse-peer-pressure"],
  },
  {
    id: "mission-norm-mirror",
    title: "Norm Mirror",
    subtitle: "What you think everyone does",
    description:
      "Guess what most people your age would do. Then see the gap between what you assumed and what they actually said.",
    missionType: "quick",
    player: "norm-mirror",
    durationMinutes: 4,
    xp: 90,
    difficulty: "core",
    ageBands: ["13-15", "16-18", "19-25", "26+"],
    categories: ["youth", "safety"],
    skillRewards: [
      { skillId: "decision-making", points: 20 },
      { skillId: "leadership", points: 18 },
      { skillId: "communication", points: 10 },
    ],
    behaviouralHook:
      "Tests perceived versus reported norms. People often overestimate how many peers would take a risk, and that overestimate makes the risk feel normal.",
    accent: "volt",
    status: "available",
    provenance: "demo-aggregate",
    relatedPulseItemIds: ["pulse-account-sharing"],
  },
  {
    id: "mission-breaksafe",
    title: "BREAKSAFE",
    subtitle: "Crime prevention as engineering",
    description:
      "A self-checkout that quietly pushes people towards the wrong outcome. Find what makes the honest choice hard, then rebuild it.",
    missionType: "build",
    player: "breaksafe",
    durationMinutes: 7,
    xp: 150,
    difficulty: "advanced",
    ageBands: ["13-15", "16-18", "19-25", "26+"],
    categories: ["safety", "community"],
    skillRewards: [
      { skillId: "safety-design", points: 40 },
      { skillId: "decision-making", points: 14 },
      { skillId: "leadership", points: 10 },
    ],
    behaviouralHook:
      "Situational prevention. Changing the environment removes the need for self-control, and does it without profiling anyone.",
    accent: "quest",
    status: "available",
    provenance: "seeded",
    relatedPulseItemIds: ["pulse-selfcheckout"],
  },
  {
    id: "mission-field-design-hunt",
    title: "Safety Design Hunt",
    subtitle: "Field Quest",
    description:
      "Walk a public space and record three places where the safe or honest action is harder than it needs to be. Check in on site, submit what you found.",
    missionType: "field",
    player: "field-checkin",
    durationMinutes: 25,
    xp: 140,
    difficulty: "core",
    ageBands: ["13-15", "16-18", "19-25", "26+"],
    categories: ["safety", "community"],
    skillRewards: [
      { skillId: "safety-design", points: 26 },
      { skillId: "community-action", points: 22 },
    ],
    behaviouralHook:
      "Moves an abstract idea into the physical world, which makes it far more likely to be recalled later.",
    accent: "volt",
    status: "available",
    provenance: "seeded",
    location: {
      area: "Tampines",
      venue: "Prototype location: Tampines Hub public concourse",
      note: "Prototype siting only. A live deployment would run with the venue's agreement.",
    },
    checkInCode: "SQ-TAMPINES",
    relatedPulseItemIds: ["pulse-selfcheckout"],
  },
  {
    id: "mission-partner-selfcheckout",
    title: "Make self-checkout safer",
    subtitle: "Prototype Partner Challenge",
    description:
      "Reduce missed scans without profiling anyone. Submit a design, pick the principle behind it, and put it in your Safety Passport.",
    missionType: "build",
    player: "build-submission",
    durationMinutes: 15,
    xp: 130,
    difficulty: "advanced",
    ageBands: ["16-18", "19-25", "26+"],
    categories: ["safety", "community"],
    skillRewards: [
      { skillId: "safety-design", points: 30 },
      { skillId: "communication", points: 18 },
      { skillId: "leadership", points: 12 },
    ],
    behaviouralHook:
      "Self-efficacy. Producing a solution, rather than receiving one, changes how capable a young person believes they are.",
    accent: "gold",
    status: "available",
    provenance: "partner-concept",
    partner: {
      name: "Retail partner concept",
      isConfirmedPartner: false,
    },
    deadline: "2026-09-30T23:59:00+08:00",
    relatedPulseItemIds: ["pulse-selfcheckout"],
  },
  {
    id: "mission-crew-relay",
    title: "Scam Relay",
    subtitle: "Crew Quest",
    description:
      "Each member takes one scam signal and explains it in a single sentence. The crew scores on how clearly the whole set reads together.",
    missionType: "crew",
    player: "scenario",
    durationMinutes: 8,
    xp: 80,
    difficulty: "core",
    ageBands: ["13-15", "16-18", "19-25"],
    categories: ["scams", "community"],
    skillRewards: [
      { skillId: "communication", points: 24 },
      { skillId: "scam-awareness", points: 14 },
    ],
    behaviouralHook:
      "Explaining something to a peer produces better retention than being told it, and it spreads the norm sideways.",
    accent: "pulse",
    status: "available",
    provenance: "seeded",
    relatedPulseItemIds: ["pulse-otp", "pulse-job-scams"],
  },
  {
    id: "mission-service",
    title: "Neighbourhood safety roadshow",
    subtitle: "Service Quest",
    description:
      "Help run a community prevention session: set up, talk to residents, hand out materials. Signup happens with the organisation, not with SIDEQUEST.",
    missionType: "service",
    player: "external",
    durationMinutes: 120,
    xp: 200,
    difficulty: "core",
    ageBands: ["16-18", "19-25", "26+"],
    categories: ["community", "safety"],
    skillRewards: [
      { skillId: "community-action", points: 40 },
      { skillId: "communication", points: 20 },
      { skillId: "leadership", points: 16 },
    ],
    behaviouralHook:
      "Contribution shifts identity: you stop being the audience for prevention and become part of delivering it.",
    accent: "volt",
    status: "available",
    provenance: "partner-concept",
    location: {
      area: "Islandwide",
      venue: "Community programmes run by verified organisations",
      note: "SIDEQUEST surfaces opportunities. The organising body handles signup and verification.",
    },
  },
  {
    id: "mission-boss",
    title: "Season One: The Safer Default",
    subtitle: "Boss Quest",
    description:
      "A season-long challenge. Crews pick one everyday system in Singapore and redesign its default so the safe action becomes the easy one.",
    missionType: "boss",
    player: "external",
    durationMinutes: 0,
    xp: 500,
    difficulty: "advanced",
    ageBands: ["13-15", "16-18", "19-25", "26+"],
    categories: ["safety", "community"],
    skillRewards: [
      { skillId: "safety-design", points: 60 },
      { skillId: "leadership", points: 40 },
      { skillId: "community-action", points: 30 },
    ],
    behaviouralHook:
      "A long horizon goal gives the shorter missions somewhere to lead, which is what keeps participation going past week two.",
    accent: "coral",
    status: "coming-soon",
    provenance: "partner-concept",
  },
];

export const MISSION_TYPE_LABELS: Record<MissionType, string> = {
  quick: "Quick Quest",
  crew: "Crew Quest",
  field: "Field Quest",
  build: "Build Quest",
  service: "Service Quest",
  boss: "Boss Quest",
};

export const MISSION_TYPE_BLURBS: Record<MissionType, string> = {
  quick: "Short scenarios you can finish on a bus ride.",
  crew: "Done with your crew, asynchronously.",
  field: "Out in a real place, with a check-in.",
  build: "You design something rather than answer something.",
  service: "Real volunteering, run by a verified organisation.",
  boss: "A season-long challenge for crews.",
};

export function getMission(id: string): Mission | undefined {
  return MISSIONS.find((mission) => mission.id === id);
}

export function getMissions(ids: string[] = []): Mission[] {
  return ids.map(getMission).filter((mission): mission is Mission => Boolean(mission));
}

export const HERO_MISSION_IDS = ["mission-rewind", "mission-norm-mirror", "mission-breaksafe"];
