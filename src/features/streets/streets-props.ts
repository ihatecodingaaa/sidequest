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
  /**
   * Which landmark this belongs to, for district memory.
   *
   * Stated rather than inferred from position. A bench on the open street is
   * near several things and the map cannot say which one it belongs to, and a
   * memory filed under the wrong place is worse than no memory.
   */
  locationId: string;
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
   * A couple of things you can do with it, and what happens.
   *
   * The whole micro-activity mechanic, and there is deliberately only one of
   * them. A vending machine, a basketball and a lift button are the same
   * interaction wearing different clothes: look at a thing, pick one of two or
   * three harmless options, see what happens. Building a bespoke minigame for
   * each would be three code paths, three sets of accessibility work and three
   * things to break, for an experience the player would not distinguish.
   *
   * None of these pays anything. That is the point of them.
   */
  choices?: { id: string; label: string; response: string }[];
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
    locationId: "court",
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
    locationId: "voiddeck",
    x: 2, y: 20,
    name: "The bench",
    lines: ["Two names and a date, scratched in years ago. Neither is a tag."],
  },
  {
    id: "prop-planter",
    locationId: "voiddeck",
    x: 12, y: 7,
    name: "The planter",
    lines: [
      "Somebody has been watering this. There is a cut-down bottle tucked behind it.",
    ],
    discovery: { id: "moment-planter", label: "Whoever waters the planter" },
  },
  {
    id: "prop-crossing",
    locationId: "busstop",
    x: 18, y: 23,
    name: "The crossing",
    lines: [
      "The button here has been pressed so many times the arrow has worn off.",
    ],
  },
  {
    id: "prop-tree-east",
    locationId: "busstop",
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
    locationId: "busstop",
    x: 27, y: 21,
    name: "The bus stop",
    lines: ["Timetable, a taped-up notice for a lost cat, and three people not talking."],
  },

  /* -------------------------------------------------------- The minimart */

  {
    id: "prop-shelf",
    locationId: "minimart",
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
    locationId: "minimart",
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
    locationId: "safehub",
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
    locationId: "foodcourt",
    mapId: "kopitiam-in",
    x: 11, y: 7,
    name: "The ceiling fan",
    lines: ["It has a wobble and a rhythm, and it is the loudest thing in here."],
  },
  {
    id: "prop-table",
    locationId: "foodcourt",
    mapId: "kopitiam-in",
    x: 6, y: 7,
    name: "The corner table",
    lines: [
      "Four chairs, three of them pulled out. Somebody left in a hurry, or with company.",
    ],
  },


  /* ------------------------------------------------------- Nothing at all

     Six things that exist because they are nice, and one of them is a
     basketball.

     Every one of these pays zero XP, unlocks nothing, and is worth no
     discovery. That is a deliberate and slightly uncomfortable decision, and
     it is the one the reward evidence supports most directly: paying for an
     interaction somebody already finds interesting is the exact cell where the
     measured undermining is largest. See docs/LIVING_DISTRICT_2_RESEARCH.md.

     They are also the answer to the honest version of the toy test. A world
     where every object teaches something is a curriculum with a walk attached,
     and a young person works that out faster than we would like. */

  {
    id: "prop-cat",
    locationId: "voiddeck",
    x: 5, y: 13,
    name: "The cat",
    lines: [
      "Orange, enormous, asleep on the warm bit of the wall.",
      "It opens one eye, decides you are not interesting, and closes it.",
    ],
  },
  {
    id: "prop-mural",
    locationId: "voiddeck",
    x: 16, y: 4,
    name: "The mural",
    lines: [
      "Somebody painted the block on the block. The tree is too big and the bus is the wrong colour.",
      "It is better than the wall was.",
    ],
  },
  {
    id: "prop-bike",
    locationId: "busstop",
    x: 33, y: 20,
    name: "The bicycle",
    lines: ["Chained to itself rather than to anything. The bell still works."],
    choices: [
      {
        id: "ring",
        label: "Ring the bell",
        response: "Two clear notes, louder than expected. A window somewhere closes.",
      },
      {
        id: "leave",
        label: "Leave it alone",
        response: "Probably wise. It is somebody's bike.",
      },
    ],
  },
  {
    id: "prop-hoop",
    locationId: "court",
    x: 22, y: 15,
    name: "The hoop",
    lines: ["Netless, a bit bent, and somebody has left a ball under it."],
    choices: [
      {
        id: "shoot",
        label: "Take a shot",
        response: "Rim, rim, in. Nobody saw it, which is the way of these things.",
      },
      {
        id: "bounce",
        label: "Just bounce it a bit",
        response: "Three bounces and the sound comes back off the block. Good sound.",
      },
      {
        id: "pass",
        label: "Put it back under the hoop",
        response: "Where the next person will find it, which is where it was.",
      },
    ],
  },
  {
    id: "prop-vending",
    locationId: "foodcourt",
    x: 31, y: 14,
    name: "The drinks machine",
    lines: ["Half the buttons have faded. Three of them still have labels."],
    choices: [
      {
        id: "grass",
        label: "Something called GRASS JELLY MAX",
        response: "It is exactly what it says. Echo looks at it, then at you.",
      },
      {
        id: "kopi",
        label: "Iced kopi, the one everybody picks",
        response: "Correct answer. It lands with a clunk and it is very cold.",
      },
      {
        id: "mystery",
        label: "The one with no label",
        response: "Barley. It is always barley. Somebody has known that for years.",
      },
    ],
  },
  {
    id: "prop-bell",
    locationId: "minimart",
    mapId: "minimart-in",
    x: 7, y: 15,
    name: "The door bell",
    lines: [
      "The little chime above the door, taped to the frame at a slight angle.",
      "It has been going all day and nobody in here hears it any more.",
    ],
  },

  /* --------------------------------------------------------- The crew room */

  {
    id: "prop-crew-wall",
    locationId: "voiddeck",
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
