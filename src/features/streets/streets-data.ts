import type { EchoStyleId } from "@/data/echo-styles";

/**
 * DISTRICT 01, the SIDEQUEST Streets vertical slice.
 *
 * One compact neighbourhood, deliberately small. A sparse world feels empty and
 * costs more to build than a dense one, so the rule applied here is that the
 * player should reach something worth stopping for within a few seconds of
 * walking in any direction from spawn.
 *
 * Everything is fictional. It is inspired by everyday Singapore, not copied
 * from any real block, and no real address, map or property layout is used.
 */

/** Tiles are 16 world units. The map is 40 x 28, so about 640 x 448 units. */
export const TILE = 16;
export const MAP_W = 40;
export const MAP_H = 28;

/**
 * Terrain codes.
 *
 * Kept to single characters so the map below reads as a picture in source,
 * which is worth more than a clever data format when somebody has to change it.
 *
 *   .  path, walkable
 *   ,  grass, walkable
 *   #  building wall, solid
 *   =  covered walkway, walkable, drawn with a roof line
 *   c  court surface, walkable
 *   t  table or seating, solid
 *   T  tree, solid
 *   b  bench, solid
 *   r  road, walkable but drawn as tarmac
 *   z  crossing stripes, walkable
 *   ~  planter edge, solid
 */
export type TerrainCode = "." | "," | "#" | "=" | "c" | "t" | "T" | "b" | "r" | "z" | "~";

export const SOLID: ReadonlySet<TerrainCode> = new Set<TerrainCode>(["#", "t", "T", "b", "~"]);

/*
 * The district, drawn as text.
 *
 * Corridors are three tiles wide almost everywhere. Two would be enough to walk
 * through and would make the player fight the geometry, which is the opposite
 * of the point: movement here is for exploring, never a skill test.
 */
export const DISTRICT_01: string[] = [
  ",,,,T,,,,,,,T,,,,,,,,,,,T,,,,,,,,,,T,,,,",
  ",TT,,,####,,,,,,####,,,,,,,,####,,,,TT,,",
  ",,,,,,####,,,T,,####,,,T,,,,####,,,,,,,,",
  ",,,,,,####,,,,,,####,,,,,,,,####,,,,,,,,",
  ",,,,,,#MM#,,,b,,#VV#,,,b,,,,#FF#,,,,,,,,",
  ",,,,,,####,,,,,,####,,,,,,,,####,,,,,,,,",
  ",,T,,,,==,,,,T,,,==,,,,,T,,,,==,,,,,,T,,",
  ",,,~~,,==,,,~,,,,==,,,,,,~,,,==,,~~,,,,,",
  ",,b,,,,==,,,,,,,,==,,,,,,,,,,==,,,,,,b,,",
  "........................................",
  "========================================",
  "........................................",
  ",,,,,,,==,,,~,,,,==,,,,,,,,,,==,,,,,T,,,",
  ",,T,T,,==,,,,b,,,==,,,,,,,,,,==,,,,T,,,,",
  ",,T,,,,==,,,,,,,,==,,,,,,,,,,==,,,,,b,,,",
  ",,,,,,####,,T,,,cccccccc,,,,####,,,,,,,,",
  ",,,,,,####,,,,,,cccccccc,,,,####,,,,,,,,",
  ",,,,,,#SS#,,b,,,cccccccc,b,,#BB#,,,,,,,,",
  ",,,,,,####,,,,,,cccccccc,,,,####,,,,,,,,",
  ",,,,T,,,,,,,,,,,cccccccc,,,,,,,,,,,T,,,,",
  ",,b,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,b,,,,",
  ",,,,,,,,,,,,,,,,b,,,,,,,,,,,,,,,,,,,,,,,",
  "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
  "rrrrrzzzrrrrrrrrrzzzrrrrrrrrrrrzzzrrrrrr",
  "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
  ",,,,,,,,T,,,,,,,,,T,,,,,,,,,,,T,,,,,,,,,",
  ",,TT,,,,,,,,bb,,,,,,,,,,,,bb,,,,,,,TT,,,",
  ",,,,,,T,,,,,,,,,,,,,b,,,,,,,,,,,,T,,,,,,",
];

/* --------------------------------------------------------------- Places */

export interface Landmark {
  id: string;
  name: string;
  /** Short line under the name in the Quest List. */
  blurb: string;
  /** Tile coordinates of the doorway, where the label is drawn. */
  x: number;
  y: number;
  accent: "quest" | "pulse" | "volt" | "coral" | "gold";
  /**
   * The wall block this landmark occupies, in tiles.
   *
   * Explicit rather than derived from `x` and `y`, because the first version
   * inferred it and put a roof in the middle of the basketball court. Open-air
   * landmarks simply have no building, which is the honest way to say it.
   */
  building?: { x: number; y: number; w: number; h: number };
  /** Shopfront colour, so the block is recognisable from across the map. */
  sign?: string;
}

/**
 * Six landmarks, each with a job. No building exists here to fill space: every
 * one of them is the front door of something the player can actually do.
 */
export const LANDMARKS: Landmark[] = [
  {
    id: "minimart",
    name: "Sunrise Minimart",
    blurb: "Open late. Self checkout at the back.",
    x: 7,
    y: 4,
    accent: "coral",
    building: { x: 6, y: 1, w: 4, h: 5 },
    sign: "#e05a4a",
  },
  {
    id: "voiddeck",
    name: "Block 118",
    blurb: "Void deck. Tables, a noticeboard, whoever is around.",
    x: 17,
    y: 4,
    accent: "quest",
    building: { x: 16, y: 1, w: 4, h: 5 },
    sign: "#6e56f8",
  },
  {
    id: "foodcourt",
    name: "Corner kopitiam",
    blurb: "Cheapest drinks in the block.",
    x: 29,
    y: 4,
    accent: "gold",
    building: { x: 28, y: 1, w: 4, h: 5 },
    sign: "#f5b93f",
  },
  {
    id: "safehub",
    name: "Community post",
    blurb: "Official help, whenever you need it.",
    x: 7,
    y: 17,
    accent: "pulse",
    building: { x: 6, y: 15, w: 4, h: 4 },
    // Institutional blue, SIDEQUEST-derived. Never a crest, never a uniform.
    sign: "#3d7de0",
  },
  {
    id: "court",
    name: "The court",
    blurb: "Somebody is always here after six.",
    x: 20,
    y: 17,
    accent: "volt",
  },
  {
    id: "busstop",
    name: "Bus stop 118",
    blurb: "Noticeboard, benches, people waiting.",
    x: 29,
    y: 17,
    accent: "pulse",
    building: { x: 28, y: 15, w: 4, h: 4 },
    sign: "#22cde6",
  },
];

/* ----------------------------------------------------------------- Cast */

/** What tapping an NPC eventually opens. */
export type NpcAction =
  | { kind: "mission"; missionId: string }
  | { kind: "campaign"; slug: string }
  | { kind: "safe" }
  | { kind: "check"; checkId: string };

export interface Npc {
  id: string;
  name: string;
  /** Which cast portrait to draw. Reuses the ONE BAD MINUTE cast. */
  characterId: "ken" | "ilyas" | "rina" | "you" | "narrator";
  /** Tile position. */
  x: number;
  y: number;
  /** Shirt colour, so the cast is distinguishable as sprites too. */
  tint: string;
  /**
   * Opening lines. One idea per bubble, and at most two before the player acts.
   * These start from a situation, never from a quiz question: nobody in this
   * district says "Hello citizen, can you answer a crime prevention question".
   */
  lines: string[];
  /** Shown instead once the linked experience is done. Short. */
  doneLines: string[];
  /** The label on the button that leaves the world. */
  cta: string;
  action: NpcAction;
  landmarkId: string;
}

export const NPCS: Npc[] = [
  {
    id: "npc-wei",
    name: "Wei",
    characterId: "ilyas",
    x: 9,
    y: 8,
    tint: "#5ac8e0",
    lines: ["Eh. Come here a second.", "I keep thinking about that thing at the shop."],
    doneLines: ["You actually said something. Most people just watch."],
    cta: "Play REWIND",
    action: { kind: "mission", missionId: "mission-rewind" },
    landmarkId: "minimart",
  },
  {
    id: "npc-ken",
    name: "Ken",
    characterId: "ken",
    x: 19,
    y: 8,
    tint: "#e8663c",
    lines: ["Ilyas is not answering the group chat.", "Something happened on Thursday."],
    doneLines: ["You saw the whole thing play out. Twice."],
    cta: "Open ONE BAD MINUTE",
    action: { kind: "campaign", slug: "one-bad-minute" },
    landmarkId: "voiddeck",
  },
  {
    id: "npc-rina",
    name: "Rina",
    characterId: "rina",
    x: 31,
    y: 8,
    tint: "#c9a2ff",
    lines: ["Settle an argument for us.", "How many people here would actually do it?"],
    doneLines: ["Turns out we were all guessing high."],
    cta: "Play Norm Mirror",
    action: { kind: "mission", missionId: "mission-norm-mirror" },
    landmarkId: "foodcourt",
  },
  {
    id: "npc-jas",
    name: "Jas",
    characterId: "rina",
    x: 22,
    y: 20,
    tint: "#8fbf2e",
    lines: ["We are four and we cannot agree.", "You in?"],
    doneLines: ["Two of us changed our minds. Nobody argued about it."],
    cta: "Play Crew Shift",
    action: { kind: "campaign", slug: "one-bad-minute" },
    landmarkId: "court",
  },
  {
    id: "npc-uncle",
    name: "Mr Tan",
    characterId: "narrator",
    x: 26,
    y: 13,
    tint: "#f0b545",
    lines: ["That machine charged me twice last week.", "Nobody could tell me why."],
    doneLines: ["You changed the machine, not the person. Smart."],
    cta: "Play BREAKSAFE",
    action: { kind: "mission", missionId: "mission-breaksafe" },
    landmarkId: "foodcourt",
  },
  {
    id: "npc-nadia",
    name: "Nadia",
    characterId: "rina",
    x: 12,
    y: 20,
    tint: "#5ac8e0",
    lines: ["Someone messaged me about a job.", "It pays a lot for basically nothing."],
    doneLines: ["You worked out what they actually wanted."],
    cta: "Take a look",
    action: { kind: "check", checkId: "check-job" },
    landmarkId: "voiddeck",
  },
  {
    id: "npc-arif",
    name: "Arif",
    characterId: "ken",
    x: 31,
    y: 20,
    tint: "#c9a2ff",
    lines: ["My cousin just video called asking for money.", "It looked like him."],
    doneLines: ["You checked another way instead of trusting the screen."],
    cta: "Take a look",
    action: { kind: "check", checkId: "check-verify" },
    landmarkId: "busstop",
  },
  {
    id: "npc-post",
    name: "Community post",
    characterId: "narrator",
    x: 9,
    y: 20,
    tint: "#3d7de0",
    lines: ["Official help, whenever you need it.", "Nothing here is a game."],
    doneLines: ["Official help, whenever you need it."],
    cta: "Open Safe",
    action: { kind: "safe" },
    landmarkId: "safehub",
  },
];

/* --------------------------------------------------------- Street Checks */

export interface StreetCheckOption {
  id: string;
  label: string;
  /** Deterministic consequence text. Never "wrong". */
  outcome: string;
  isSafest?: boolean;
}

export interface StreetCheck {
  id: string;
  title: string;
  /** The situation, in one or two short beats. */
  setup: string[];
  question: string;
  options: StreetCheckOption[];
  /** One line, after the choice. This is the whole lesson. */
  takeaway: string;
  xp: number;
  /** Where the factual guidance comes from. Rendered after the interaction. */
  source: { label: string; body: string };
}

/**
 * Two optional micro-encounters, ten to thirty seconds each.
 *
 * These are side content by design. Track B's hero material is peer pressure,
 * impulsivity, account misuse and peer intervention, and the district's four
 * hero missions carry that. These two exist because a district where somebody
 * shows you a message on their phone is a realistic district, not because scam
 * content should grow.
 */
export const STREET_CHECKS: Record<string, StreetCheck> = {
  "check-job": {
    id: "check-job",
    title: "The job offer",
    setup: [
      "Nadia holds out her phone. A message offering $400 a day, work from home.",
      "It asks her to receive a payment and forward it on.",
    ],
    question: "What do you tell her?",
    options: [
      {
        id: "receive",
        label: "Try it once and see if the money is real",
        outcome:
          "The first payment is often real. That is what makes the second request easier to say yes to, and the account is hers either way.",
      },
      {
        id: "ask",
        label: "Nobody legitimate needs your bank account to pay you",
        outcome:
          "She reads it again and notices there is no company she can look up. Moving money for someone else is how people end up as money mules.",
        isSafest: true,
      },
      {
        id: "ignore",
        label: "Just ignore it and move on",
        outcome:
          "Safe enough for her. She forwards it to two friends first, and one of them asks what the catch is.",
      },
    ],
    takeaway: "A real job pays you. It does not ask to use your account.",
    xp: 25,
    source: {
      label: "Singapore Police Force advisories",
      body: "Receiving and transferring money for someone else can make a person a money mule, which is treated seriously even where the person says they did not know.",
    },
  },
  "check-verify": {
    id: "check-verify",
    title: "The video call",
    setup: [
      "Arif shows you a screen recording. His cousin, on video, asking for a transfer tonight.",
      "It sounds like him. It looks like him.",
    ],
    question: "What do you tell him?",
    options: [
      {
        id: "look",
        label: "Look closely at the video for something off",
        outcome:
          "He watches it four more times and is no more certain than before. Fabricated video can be convincing enough that studying it does not settle anything.",
      },
      {
        id: "callback",
        label: "Hang up and call the number you already have",
        outcome:
          "His actual cousin picks up, confused, halfway through dinner. Nobody asked for anything.",
        isSafest: true,
      },
      {
        id: "askq",
        label: "Ask a question only the real cousin would know",
        outcome:
          "Better than nothing, and it can be researched or guessed. Verifying through a channel you already trust is the stronger move.",
      },
    ],
    takeaway: "Verify the request, not the face. Use a number you already had.",
    xp: 25,
    source: {
      label: "ScamShield",
      body: "Impersonation using fabricated audio or video can be difficult to identify by sight alone. Confirming through a separately known contact method is the reliable check.",
    },
  },
};

/* --------------------------------------------------------------- Avatar */

export const SKIN_TONES = ["#f2d3b6", "#e7bd94", "#c98d5f", "#9c6238", "#6b4226"] as const;
export const HAIR_COLOURS = ["#241a12", "#5a3a22", "#111318", "#8a4b2a", "#d9d2c6"] as const;
export const TOP_COLOURS = ["#6e56f8", "#22cde6", "#b6f24a", "#ff6b6b", "#f5b93f", "#f06fd0"] as const;
export const HAIR_STYLES = ["short", "swept", "tied", "curls"] as const;

export type HairStyle = (typeof HAIR_STYLES)[number];

export interface AvatarLook {
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  top: string;
}

export const DEFAULT_AVATAR: AvatarLook = {
  skin: SKIN_TONES[1],
  hair: HAIR_COLOURS[0],
  hairStyle: "short",
  top: TOP_COLOURS[0],
};

/** Deterministic default for the demo, so a reset always looks the same. */
export const DEMO_AVATAR: AvatarLook = {
  skin: SKIN_TONES[2],
  hair: HAIR_COLOURS[1],
  hairStyle: "swept",
  top: TOP_COLOURS[1],
};

/** Where the player starts. Central, with an NPC a few seconds away. */
export const SPAWN = { x: 20, y: 11 };

export interface StreetsSave {
  look: AvatarLook;
  /** Street Checks finished. Hero missions are read from the profile instead. */
  checksDone: string[];
  echo: EchoStyleId | null;
}
