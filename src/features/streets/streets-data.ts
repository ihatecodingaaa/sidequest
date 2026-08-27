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
 *
 * Indoors only:
 *
 *   f  floor, walkable
 *   s  shelving, solid
 *   k  counter, solid
 *   m  machine, solid
 *   n  noticeboard, solid
 *   d  doormat, walkable, the way back out
 */
export type TerrainCode =
  | "."
  | ","
  | "#"
  | "="
  | "c"
  | "t"
  | "T"
  | "b"
  | "r"
  | "z"
  | "~"
  | "f"
  | "s"
  | "k"
  | "m"
  | "n"
  | "d";

/**
 * Every character the map may contain.
 *
 * Anything else in a map row is a landmark door letter, which is part of a
 * wall. That test used to be "is it uppercase", which quietly swallowed `T`:
 * every tree in the district was drawn as a cream wall tile for as long as the
 * district has existed. Collision still worked, because a wall and a tree are
 * both solid, so nothing failed loudly. It just looked wrong.
 */
export const TERRAIN_CODES: ReadonlySet<string> = new Set<string>([
  ".",
  ",",
  "#",
  "=",
  "c",
  "t",
  "T",
  "b",
  "r",
  "z",
  "~",
  "f",
  "s",
  "k",
  "m",
  "n",
  "d",
]);

export const SOLID: ReadonlySet<TerrainCode> = new Set<TerrainCode>([
  "#",
  "t",
  "T",
  "b",
  "~",
  "s",
  "k",
  "m",
  "n",
]);

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
  ",,,,,,####,,,b,,####,,,b,,,,####,,,,,,,,",
  ",,,,,,#MM#,,,,,,#VV#,,,,,,,,#FF#,,,,,,,,",
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
  ",,,,,,####,,b,,,cccccccc,b,,####,,,,,,,,",
  ",,,,,,#SS#,,,,,,cccccccc,,,,#BB#,,,,,,,,",
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
  /** The interior this door opens, when there is one worth entering. */
  interiorId?: string;
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
    y: 5,
    accent: "coral",
    building: { x: 6, y: 1, w: 4, h: 5 },
    sign: "#e05a4a",
    interiorId: "minimart-in",
  },
  {
    id: "voiddeck",
    name: "Block 118",
    blurb: "Void deck. Tables, a noticeboard, whoever is around.",
    x: 17,
    y: 5,
    accent: "quest",
    building: { x: 16, y: 1, w: 4, h: 5 },
    sign: "#6e56f8",
  },
  {
    id: "foodcourt",
    name: "Corner kopitiam",
    blurb: "Cheapest drinks in the block.",
    x: 29,
    y: 5,
    accent: "gold",
    building: { x: 28, y: 1, w: 4, h: 5 },
    sign: "#f5b93f",
    interiorId: "kopitiam-in",
  },
  {
    id: "safehub",
    name: "Community post",
    blurb: "Official help, whenever you need it.",
    x: 7,
    y: 18,
    accent: "pulse",
    building: { x: 6, y: 15, w: 4, h: 4 },
    // Institutional blue, SIDEQUEST-derived. Never a crest, never a uniform.
    sign: "#3d7de0",
    interiorId: "post-in",
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
    y: 18,
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
  | { kind: "check"; checkId: string }
  /** The rewards counter, which is the existing claim flow behind a counter. */
  | { kind: "rewards" }
  /** Something to read and nothing to open. Noticeboards, mostly. */
  | { kind: "info" };

export interface Npc {
  id: string;
  name: string;
  /** Which cast portrait to draw. Reuses the ONE BAD MINUTE cast. */
  characterId: "ken" | "ilyas" | "rina" | "you" | "narrator";
  /**
   * Which map this one stands on. Absent means the district itself.
   *
   * Interiors reuse the whole NPC path rather than inventing a second kind of
   * interactable, so a self checkout and a neighbour are the same shape of
   * thing to the engine, the dialogue overlay and the Quest List.
   */
  mapId?: string;
  /**
   * What to draw in the world, and whether the dialogue shows a face.
   *
   * A machine is not a person, and drawing one as a person would be the
   * clearest possible way to imply that objects have intentions.
   */
  figure?: "person" | "machine" | "board" | "counter";
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
  /**
   * Shown as a provenance tag inside the conversation.
   *
   * Required on anything that looks like a community feed. A noticeboard that
   * lists what the block is doing this week is invented content, and the rule
   * is per claim and per screen: the reader finds that out on the screen that
   * makes the claim, not in a document.
   */
  provenance?: string;
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
    /*
     * Behind the desk rather than out on the pavement.
     *
     * A door to real help should be a door. It also means the one place in the
     * district that stops being playful is a room you choose to walk into,
     * which is the correct amount of ceremony for it.
     */
    mapId: "post-in",
    x: 6,
    y: 3,
    tint: "#3d7de0",
    lines: ["Official help, whenever you need it.", "Nothing here is a game."],
    doneLines: ["Official help, whenever you need it."],
    cta: "Open Safe",
    action: { kind: "safe" },
    landmarkId: "safehub",
  },

  /* ------------------------------------------------- Inside the minimart */

  {
    id: "npc-bea",
    name: "Bea",
    characterId: "rina",
    mapId: "minimart-in",
    x: 3,
    y: 14,
    tint: "#f06fd0",
    lines: ["Five things in the basket.", "She scanned three and she is watching me."],
    doneLines: ["You just scanned it. Nobody had to make it a whole thing."],
    cta: "Take a look",
    action: { kind: "check", checkId: "check-checkout" },
    landmarkId: "minimart",
  },
  {
    id: "npc-checkout",
    name: "Self checkout 2",
    characterId: "narrator",
    figure: "machine",
    mapId: "minimart-in",
    x: 11,
    y: 14,
    tint: "#9aa2b4",
    lines: [
      "SCAN EACH ITEM. PLACE IT IN THE BAG.",
      "This area is recorded. Nothing is checked at the machine. It gets checked later.",
    ],
    doneLines: ["SCAN EACH ITEM. PLACE IT IN THE BAG."],
    cta: "Read the screen",
    action: { kind: "info" },
    landmarkId: "minimart",
  },

  /* -------------------------------------------- Inside the community post */

  {
    id: "npc-board-post",
    name: "Noticeboard",
    characterId: "narrator",
    figure: "board",
    mapId: "post-in",
    x: 2,
    y: 5,
    tint: "#c9b98a",
    lines: [
      "THIS MONTH ON THE BLOCK",
      "Court open till ten. Two schools running the shop floor check. Crew sign-ups at the kopitiam counter.",
    ],
    doneLines: ["THIS MONTH ON THE BLOCK"],
    cta: "Read the board",
    action: { kind: "info" },
    provenance: "Seeded demo noticeboard. Not a live community feed, and no school or organisation has agreed to any of it.",
    landmarkId: "safehub",
  },

  /* ------------------------------------------------ Inside the kopitiam */

  {
    id: "npc-counter",
    name: "Mei",
    characterId: "rina",
    mapId: "kopitiam-in",
    x: 3,
    y: 3,
    tint: "#f5b93f",
    lines: ["You are the SIDEQUEST one right?", "Come, I check what you can take."],
    doneLines: ["Come, I check what you can take."],
    cta: "Open the counter",
    action: { kind: "rewards" },
    landmarkId: "foodcourt",
  },
  {
    id: "npc-board-kopi",
    name: "Counter notice",
    characterId: "narrator",
    figure: "board",
    mapId: "kopitiam-in",
    x: 10,
    y: 4,
    tint: "#c9b98a",
    lines: [
      "PARTICIPATING SHOPS",
      "This counter is a concept for how a neighbourhood shop could honour a SIDEQUEST reward. No shop has agreed to it.",
    ],
    doneLines: ["PARTICIPATING SHOPS"],
    cta: "Read the notice",
    action: { kind: "info" },
    provenance: "Concept only. No retailer, brand or organisation is a SIDEQUEST partner, and nothing claimed here has monetary value.",
    landmarkId: "foodcourt",
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
  /*
   * The one that carries Track B.
   *
   * Shop theft with a friend standing there is the everyday version of the
   * thing this product is actually about: an ordinary young person, a few
   * seconds, and somebody watching to see what you do. It sits inside the
   * minimart rather than on the street because the room is the point. You are
   * standing at the machine while you decide.
   */
  "check-checkout": {
    id: "check-checkout",
    title: "Five things, three scanned",
    setup: [
      "Bea has five things in the basket. She scans three and starts bagging.",
      "She does not say anything. She just waits to see what you do.",
    ],
    question: "What do you do?",
    options: [
      {
        id: "scan",
        label: "Scan the last two yourself",
        outcome:
          "The machine beeps twice and it is over. No speech, no argument, and she pays without saying anything about it.",
        isSafest: true,
      },
      {
        id: "say",
        label: "Tell her out loud to put them back",
        outcome:
          "It works, and it is harder than it sounds with people around. Doing the thing is usually easier than announcing it.",
      },
      {
        id: "quiet",
        label: "Say nothing. It is not your basket",
        outcome:
          "You walk out together. Whether anything comes of it is decided later by someone reviewing footage, not by either of you at the machine.",
      },
    ],
    takeaway: "The move that costs least is usually a hand, not a speech.",
    xp: 25,
    source: {
      label: "Singapore Police Force crime prevention advisories",
      body: "Shop theft is theft regardless of how small the item is. Self checkout areas are recorded, and what happens next is decided from that footage rather than at the machine.",
    },
  },
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

/* ------------------------------------------------------------- Interiors */

/**
 * A place the player can be.
 *
 * The district and the three rooms are the same shape of thing, which is what
 * keeps the engine from growing a second code path: entering a shop swaps the
 * map and repaints, and nothing else about movement, collision, dialogue or
 * the camera changes.
 *
 * Only three buildings open, and each was given an interior because it has a
 * job that is genuinely spatial. A room you walk into and out of with nothing
 * in it is worse than a door that stays shut.
 */
export interface Door {
  id: string;
  /** The doorway tile itself. The player stands in front of it, not on it. */
  x: number;
  y: number;
  /** The map on the other side. */
  to: string;
  /** Where the player lands over there. */
  at: { x: number; y: number };
  /** Two words, because it goes on the interact button. */
  label: string;
  /** Where this leads, in words, for the HUD and the button's accessible name. */
  name: string;
}

export interface WorldMap {
  id: string;
  name: string;
  rows: string[];
  w: number;
  h: number;
  indoor: boolean;
  /** Painted behind the map when the viewport is larger than the map is. */
  surround: string;
  /**
   * The room's accent, which is the same colour as its sign outside.
   *
   * A player who walks into the red shop should be standing in a room with red
   * in it. That is most of what makes three rooms of the same size feel like
   * three different places without building three sets of fixtures.
   */
  tint?: string;
  doors: Door[];
  /** Buildings to draw. Interiors have none: they are already inside one. */
  landmarks: Landmark[];
}

export const DISTRICT_ID = "district";

/**
 * Interiors are 14 wide by 18 deep.
 *
 * Deeper than they are wide, because a phone held upright is, and a room whose
 * proportions fight the screen can only be shown by either cropping it or
 * framing it in a wide band of nothing. A shop with aisles running front to
 * back is also just what a shop looks like.
 */
const IN_W = 14;
const IN_H = 18;

const MINIMART_IN: string[] = [
    "##############",
    "#ffffffffffff#",
    "#fkkkkkffffff#",
    "#ffffffffffff#",
    "#ffsssffsssff#",
    "#ffsssffsssff#",
    "#ffffffffffff#",
    "#ffsssffsssff#",
    "#ffsssffsssff#",
    "#ffffffffffff#",
    "#ffsssffsssff#",
    "#ffsssffsssff#",
    "#ffffffffffff#",
    "#fmmffffffmmf#",
    "#ffffffffffff#",
    "#ffffffffffff#",
    "######dd######",
    "##############",
];

const POST_IN: string[] = [
    "##############",
    "#ffffffffffff#",
    "#ffkkkkkkkkff#",
    "#ffffffffffff#",
    "#ffffffffffff#",
    "#fnnnffffffff#",
    "#ffffffffffff#",
    "#ff~ffffff~ff#",
    "#ffffffffffff#",
    "#ffkkkffkkkff#",
    "#ffffffffffff#",
    "#ffkkkffkkkff#",
    "#ffffffffffff#",
    "#ffffffffffff#",
    "#ffffffffffff#",
    "#ffffffffffff#",
    "######dd######",
    "##############",
];

const KOPITIAM_IN: string[] = [
    "##############",
    "#ffffffffffff#",
    "#fkkkkkffffff#",
    "#ffffffffffff#",
    "#fffffffffnnf#",
    "#ffffffffffff#",
    "#ffttffffttff#",
    "#ffffffffffff#",
    "#ffttffffttff#",
    "#ffffffffffff#",
    "#ffttffffttff#",
    "#ffffffffffff#",
    "#ffttffffttff#",
    "#ffffffffffff#",
    "#ffffffffffff#",
    "#ffffffffffff#",
    "######dd######",
    "##############",
];

/** The way back out. Every interior has exactly one, on the doormat. */
function exitDoor(to: { x: number; y: number }, name: string): Door {
  return { id: "door-out", x: 6, y: 16, to: DISTRICT_ID, at: to, label: "Step out", name };
}

export const MAPS: Record<string, WorldMap> = {
  [DISTRICT_ID]: {
    id: DISTRICT_ID,
    name: "District 01",
    rows: DISTRICT_01,
    w: MAP_W,
    h: MAP_H,
    indoor: false,
    surround: "#3f7a46",
    landmarks: LANDMARKS,
    /*
     * Derived rather than listed, so a door can never point at a building that
     * is not there and a building can never quietly lose its door.
     */
    doors: LANDMARKS.filter((entry) => entry.interiorId).map((entry) => ({
      id: `door-${entry.id}`,
      x: entry.x,
      y: entry.y,
      to: entry.interiorId as string,
      at: { x: 6, y: 15 },
      label: "Go in",
      name: entry.name,
    })),
  },
  "minimart-in": {
    id: "minimart-in",
    name: "Sunrise Minimart",
    rows: MINIMART_IN,
    w: IN_W,
    h: IN_H,
    indoor: true,
    surround: "#171b22",
    tint: "#e05a4a",
    landmarks: [],
    doors: [exitDoor({ x: 7, y: 6 }, "the street")],
  },
  "post-in": {
    id: "post-in",
    name: "Community post",
    rows: POST_IN,
    w: IN_W,
    h: IN_H,
    indoor: true,
    surround: "#141922",
    tint: "#3d7de0",
    landmarks: [],
    doors: [exitDoor({ x: 7, y: 19 }, "the street")],
  },
  "kopitiam-in": {
    id: "kopitiam-in",
    name: "Corner kopitiam",
    rows: KOPITIAM_IN,
    w: IN_W,
    h: IN_H,
    indoor: true,
    surround: "#1d1a15",
    tint: "#f5b93f",
    landmarks: [],
    doors: [exitDoor({ x: 29, y: 6 }, "the street")],
  },
};

/* --------------------------------------------------------------- Avatar */

export const SKIN_TONES = [
  "#f2d3b6",
  "#e7bd94",
  "#c98d5f",
  "#9c6238",
  "#7a4a2b",
  "#5c3520",
] as const;
export const HAIR_COLOURS = [
  "#241a12",
  "#5a3a22",
  "#111318",
  "#8a4b2a",
  "#d9d2c6",
  "#6e56f8",
  "#2f7f6a",
] as const;
export const TOP_COLOURS = [
  "#6e56f8",
  "#22cde6",
  "#b6f24a",
  "#ff6b6b",
  "#f5b93f",
  "#f06fd0",
  "#f4f6fb",
  "#2c3550",
] as const;

/**
 * Head, including headwear.
 *
 * `tudung` is here for the same reason the skin tones go darker than they did:
 * this is a Singapore youth product, and a customiser that cannot make a
 * recognisable proportion of its audience is not finished. It is drawn as a
 * silhouette like every other option, with no attempt at detail it cannot
 * carry at this size.
 */
export const HAIR_STYLES = [
  "short",
  "swept",
  "tied",
  "curls",
  "buzz",
  "long",
  "tudung",
] as const;

/**
 * One extra thing, visible in the world from every direction.
 *
 * Cosmetic only, all of it available from the start. Nothing here is earned,
 * priced, dropped or bundled, because the moment a look has a cost the world
 * acquires a reason to grind and the scenarios become the obstacle in front of
 * it.
 */
export const ACCESSORIES = ["none", "glasses", "cap", "headphones", "bag"] as const;

export type HairStyle = (typeof HAIR_STYLES)[number];
export type Accessory = (typeof ACCESSORIES)[number];

export interface AvatarLook {
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  top: string;
  /** Optional so a look saved before accessories existed stays valid. */
  accessory?: Accessory;
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
  accessory: "headphones",
};

/** Where the player starts. Central, with an NPC a few seconds away. */
export const SPAWN = { x: 20, y: 11 };

export interface StreetsSave {
  look: AvatarLook;
  /** Street Checks finished. Hero missions are read from the profile instead. */
  checksDone: string[];
  echo: EchoStyleId | null;
}
