import type { ProtectiveFactorId } from "@/types/protective";

/**
 * Things in the district worth stopping at.
 *
 * ---
 *
 * ## The problem this solves
 *
 * The world was full of objects that were drawn and then did nothing. Benches,
 * planters, the noticeboard by the lift, the court, the shop shelves: all
 * present, all inert. Walking past them taught a player, within about a
 * minute, that only the people matter and everything else is wallpaper. That
 * is what made a world with nine residents and six landmarks still feel like a
 * corridor between objectives.
 *
 * A prop is the cheapest possible fix. It is a tile, a name, and one or two
 * short lines. No quest, no XP, no state machine.
 *
 * ## The rules
 *
 * **Not everything is a prop.** The brief's own warning is the right one: a
 * world where every tile is a button is as dead as one where none of them is,
 * because the player stops believing any of it means anything. These are
 * placed where somebody would plausibly look, and there are deliberately large
 * stretches of the map with nothing in them.
 *
 * **A prop is an observation, not a lesson.** Most of these teach nothing.
 * They are weather, texture, somebody else's Tuesday. The world needs oxygen,
 * and a product where every object delivers a prevention message is one nobody
 * wants to walk around in. The few that do carry something say it the way a
 * person would notice it, not the way a curriculum would state it.
 *
 * **Nothing here pays XP.** Discoveries are cosmetic and the ledger for them
 * is separate. Paying for looking at benches would turn the district into a
 * field to be harvested, and it would scale the reward economy with the number
 * of props, which is exactly the inflation the rewards rules forbid.
 */

export interface WorldProp {
  id: string;
  /** Absent means the district itself. */
  mapId?: string;
  x: number;
  y: number;
  /** Goes on the interact button. Two or three words. */
  name: string;
  /** What you notice. One or two short lines, in the world's own register. */
  lines: string[];
  /**
   * A district moment, if this one is worth keeping.
   *
   * Cosmetic, free, deterministic, and worth no XP. Most props have none: a
   * collectible behind every object is a checklist, and a checklist is the
   * opposite of noticing something.
   */
  discovery?: DistrictMoment;
  /**
   * A protective factor this observation happens to illustrate.
   *
   * Optional and rare. Where it is present the prop is doing prevention work
   * by describing a place rather than by lecturing, which is the only way
   * situational prevention reads as anything other than a poster.
   */
  factor?: ProtectiveFactorId;
}

export interface DistrictMoment {
  id: string;
  /** What the player collected, named as a moment rather than an item. */
  label: string;
}

export const WORLD_PROPS: WorldProp[] = [
  /* ------------------------------------------------------- The district */

  {
    id: "prop-court",
    x: 20, y: 18,
    name: "The court",
    lines: [
      "Somebody has drawn a free throw line in chalk. It is in the wrong place.",
      "Nobody has corrected it.",
    ],
    discovery: { id: "moment-court", label: "The chalk line at the court" },
  },
  {
    id: "prop-bench-west",
    x: 2, y: 20,
    name: "The bench",
    lines: ["Two names and a date, scratched in years ago. Neither is a tag."],
  },
  {
    id: "prop-planter",
    x: 12, y: 7,
    name: "The planter",
    lines: [
      "Somebody has been watering this. There is a cut-down bottle tucked behind it.",
    ],
    discovery: { id: "moment-planter", label: "Whoever waters the planter" },
  },
  {
    id: "prop-crossing",
    x: 18, y: 23,
    name: "The crossing",
    lines: [
      "The button here has been pressed so many times the arrow has worn off.",
    ],
  },
  {
    id: "prop-tree-east",
    x: 36, y: 12,
    name: "The big tree",
    lines: [
      "Shade, a dropped hair tie, and a good view of the whole block.",
      "This is where people wait when they do not want to look like they are waiting.",
    ],
    discovery: { id: "moment-tree", label: "The waiting spot" },
  },
  {
    /*
     * West of Arif rather than under him.
     *
     * This was first placed one tile from where he stands, and since a person
     * always wins the interact button that made it a prop nobody could ever
     * look at: present in the data, unreachable in the world, silent about it.
     * A unit test fails the build if anything lands there again.
     */
    id: "prop-busstop",
    x: 27, y: 21,
    name: "The bus stop",
    lines: ["Timetable, a taped-up notice for a lost cat, and three people not talking."],
  },

  /* -------------------------------------------------------- The minimart */

  {
    id: "prop-shelf",
    mapId: "minimart-in",
    x: 3, y: 6,
    name: "The shelves",
    lines: [
      "The expensive things are at the back, furthest from the counter.",
      "That is a decision somebody made, and it is the same in every shop.",
    ],
    factor: "environment-changed",
    discovery: { id: "moment-shelf", label: "Why the back shelf is the back shelf" },
  },
  {
    id: "prop-mirror",
    mapId: "minimart-in",
    x: 11, y: 6,
    name: "The corner mirror",
    lines: [
      "Convex, high up, angled at the door rather than at the aisle.",
      "It shows the counter who is coming in, not what anybody is doing.",
    ],
  },

  /* ----------------------------------------------------- The community post */

  {
    id: "prop-lift-board",
    mapId: "post-in",
    x: 3, y: 8,
    name: "The lift lobby board",
    lines: [
      "A block party, a lost key, and a form nobody has taken a tab off.",
    ],
    discovery: { id: "moment-board", label: "The block party nobody signed up for" },
  },

  /* -------------------------------------------------------- The kopitiam */

  {
    id: "prop-fan",
    mapId: "kopitiam-in",
    x: 11, y: 7,
    name: "The ceiling fan",
    lines: ["It has a wobble and a rhythm, and it is the loudest thing in here."],
  },
  {
    id: "prop-table",
    mapId: "kopitiam-in",
    x: 6, y: 7,
    name: "The corner table",
    lines: [
      "Four chairs, three of them pulled out. Somebody left in a hurry, or with company.",
    ],
  },

  /* --------------------------------------------------------- The crew room */

  {
    id: "prop-crew-wall",
    mapId: "hub-in",
    x: 3, y: 7,
    name: "The wall",
    lines: [
      "Photos of the block. A tree that is smaller than it is now, and the same bench.",
    ],
    discovery: { id: "moment-wall", label: "The block, a few years ago" },
  },
];

/** Everything findable, for the collection screen. */
export const DISTRICT_MOMENTS: DistrictMoment[] = WORLD_PROPS.flatMap((prop) =>
  prop.discovery ? [prop.discovery] : [],
);

export function propsOn(mapId: string, districtId: string): WorldProp[] {
  return WORLD_PROPS.filter((prop) => (prop.mapId ?? districtId) === mapId);
}
