import {
  Banknote,
  Bus,
  Clock,
  DoorOpen,
  Eye,
  HandHeart,
  Handshake,
  Hash,
  KeyRound,
  MessageCircle,
  School,
  ShieldQuestion,
  ShoppingBasket,
  Trees,
  UserRoundCheck,
  Users,
  Volleyball,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";


import type { ProtectiveFactorId } from "@/types/protective";

/**
 * The Quick Quest Builder.
 *
 * ---
 *
 * ## The problem this replaces
 *
 * "Build a quest" used to be four `<textarea>` fields: title, hook, moment,
 * response. It was the single clearest source of the tester complaint that
 * there is too much typing, and on a phone it is worse than it looks on a
 * laptop: Palin and colleagues measured average mobile typing at roughly 36
 * words per minute across 37,000 people, so four free-text fields is not a
 * small ask of a sixteen year old standing at a roadshow booth.
 *
 * The wrong fix is deleting the feature. Youth co-creation is the Youth-Led
 * criterion in the Delta Track B brief, and it is one of the few things in
 * this product that a young person makes rather than consumes. Removing typing
 * must make co-creation *easier*, not shallower.
 *
 * ## So the builder is four taps
 *
 * Where, what starts it, what decision matters, what could change the outcome.
 * Those are the four questions a prevention scenario actually consists of, and
 * a young person answering them by tapping has authored the same structure the
 * old form was asking them to write out longhand. The prose is then generated
 * from their four choices by a template in this file.
 *
 * ## The generation is a template and says so
 *
 * There is no model here and no network call. `generateQuestDraft` is string
 * concatenation over the four ids, it is deterministic, and the same four taps
 * always produce the same draft. The screen says "assembled from your four
 * choices" rather than anything implying it was written for them, because
 * claiming otherwise would be exactly the kind of quiet dishonesty the rest of
 * this codebase spends a unit test suite preventing.
 *
 * ## Where the fourth step's vocabulary comes from
 *
 * `PROTECTIVE_FACTORS`, unchanged. Inventing a parallel list of things that
 * change an outcome would have produced two vocabularies for one idea and a
 * slow drift between them. The builder adds only its own phrasing of each
 * factor as a *move*, below, because "Someone handed over an excuse" describes
 * a story and "give them a way to step back" describes what to do.
 */

/* ------------------------------------------------------------- Step one */

export interface QuestSetting {
  id: string;
  /** Button label. One or two words. */
  label: string;
  /** Goes on the end of the generated title: "at the minimart". */
  titleTail: string;
  /** Goes inside the generated hook: "in the aisle, with people around". */
  where: string;
  icon: LucideIcon;
  /**
   * Offered on the first page or behind "Somewhere else".
   *
   * Six is about as many choices as fit on a 390px screen without scrolling,
   * and a first screen that scrolls is a first screen that looks like a form.
   */
  secondary?: boolean;
}

export const QUEST_SETTINGS: QuestSetting[] = [
  {
    id: "minimart",
    label: "Minimart",
    titleTail: "at the minimart",
    where: "in the aisle, with people around",
    icon: ShoppingBasket,
  },
  {
    id: "school",
    label: "School",
    titleTail: "at school",
    where: "between lessons, where everyone can see",
    icon: School,
  },
  {
    id: "groupchat",
    label: "Group chat",
    titleTail: "in the group chat",
    where: "in a chat nobody wants to be the first to leave",
    icon: MessageCircle,
  },
  {
    id: "voiddeck",
    label: "Void deck",
    titleTail: "at the void deck",
    where: "downstairs, late enough that it is quiet",
    icon: Trees,
  },
  {
    id: "transport",
    label: "MRT or bus",
    titleTail: "on the way home",
    where: "on the ride home, with nowhere to step away to",
    icon: Bus,
  },
  {
    id: "hangout",
    label: "Sports or hangout",
    titleTail: "at the court",
    where: "at the court, in front of the whole group",
    icon: Volleyball,
  },
  {
    id: "work",
    label: "A part-time job",
    titleTail: "at work",
    where: "on a shift, where saying no has a cost",
    icon: Clock,
    secondary: true,
  },
  {
    id: "online",
    label: "Somewhere online",
    titleTail: "online",
    where: "in a chat with somebody nobody has actually met",
    icon: Hash,
    secondary: true,
  },
];

/* ------------------------------------------------------------- Step two */

export interface QuestTrigger {
  id: string;
  label: string;
  /** Goes on the front of the generated title: "The dare". */
  titleHead: string;
  /**
   * The generated hook. `{where}` is replaced by the setting's phrase.
   *
   * Written to describe a moment rather than a person, on the same rule the
   * Signals follow: a scenario that opens by classifying somebody has already
   * taught the wrong thing before the player has done anything.
   */
  hook: string;
  /** Which decisions this trigger makes sense of. Order is the display order. */
  decisionIds: string[];
  icon: LucideIcon;
  secondary?: boolean;
}

export const QUEST_TRIGGERS: QuestTrigger[] = [
  {
    id: "dare",
    label: "A dare",
    titleHead: "The dare",
    hook: "Somebody is being pushed into something small {where}, because everyone is watching.",
    decisionIds: ["go-along", "walk-away", "say-privately", "give-exit"],
    icon: Eye,
  },
  {
    id: "quick-money",
    label: "Quick money",
    titleHead: "The easy money",
    hook: "There is money on offer {where}, and nobody wants to ask what it is for.",
    decisionIds: ["go-along", "walk-away", "say-privately", "ask-adult"],
    icon: Banknote,
  },
  {
    id: "everyone",
    label: "Everyone does it",
    titleHead: "Everyone does it",
    hook: "It is being described as normal {where}, and nobody has said otherwise yet.",
    decisionIds: ["go-along", "walk-away", "say-privately", "give-exit"],
    icon: Users,
  },
  {
    id: "account",
    label: "Someone wants an account",
    titleHead: "The favour",
    hook: "Somebody is being asked for a login {where}. Just for a week, they said.",
    decisionIds: ["go-along", "walk-away", "say-privately", "ask-adult"],
    icon: KeyRound,
  },
  {
    id: "pressured",
    label: "Someone is being pressured",
    titleHead: "The squeeze",
    hook: "One person has stopped answering {where}, and the pushing has not stopped.",
    decisionIds: ["walk-away", "say-privately", "give-exit", "stay-with", "ask-adult"],
    icon: ShieldQuestion,
  },
  {
    id: "needs-help",
    label: "Someone needs help",
    titleHead: "The one who needs a hand",
    hook: "Somebody {where} needs help and has not asked for it out loud.",
    decisionIds: ["stay-with", "say-privately", "ask-staff", "ask-adult"],
    icon: HandHeart,
  },
  {
    id: "risky-place",
    label: "A risky set-up",
    titleHead: "The set-up",
    hook: "Nothing has gone wrong {where} yet, and the place is making the wrong thing easy.",
    decisionIds: ["change-place", "ask-staff", "say-privately", "walk-away"],
    icon: Wrench,
    secondary: true,
  },
  {
    id: "left-out",
    label: "Somebody is being left out",
    titleHead: "The one left out",
    hook: "One person is on the outside of it {where}, and it is starting to be the point.",
    decisionIds: ["stay-with", "say-privately", "give-exit", "ask-adult"],
    icon: Handshake,
    secondary: true,
  },
];

/* ----------------------------------------------------------- Step three */

export interface QuestDecision {
  id: string;
  label: string;
  /** Goes inside the generated question: "give them a way out". */
  moment: string;
  /** Goes into the generated response: "Say something privately". */
  response: string;
  icon: LucideIcon;
}

export const QUEST_DECISIONS: Record<string, QuestDecision> = {
  "go-along": {
    id: "go-along",
    label: "Go along with it",
    moment: "go along",
    response: "Go along with it and see where it lands",
    icon: Users,
  },
  "walk-away": {
    id: "walk-away",
    label: "Walk away",
    moment: "walk away",
    response: "Walk away, and take whoever will come with you",
    icon: DoorOpen,
  },
  "say-privately": {
    id: "say-privately",
    label: "Say something privately",
    moment: "say something privately",
    response: "Say it privately, away from whoever is watching",
    icon: MessageCircle,
  },
  "give-exit": {
    id: "give-exit",
    label: "Give them a way out",
    moment: "give them a way out",
    response: "Hand them a reason to drop it that costs them nothing",
    icon: DoorOpen,
  },
  "ask-adult": {
    id: "ask-adult",
    label: "Get a trusted adult",
    moment: "bring in somebody who can actually help",
    response: "Tell somebody with the standing to do something about it",
    icon: UserRoundCheck,
  },
  "ask-staff": {
    id: "ask-staff",
    label: "Ask staff for help",
    moment: "ask the staff",
    response: "Ask the staff, who are already there and already paid to help",
    icon: Handshake,
  },
  "change-place": {
    id: "change-place",
    label: "Change the situation",
    moment: "change the situation itself",
    response: "Change the set-up so the honest option is the easy one",
    icon: Wrench,
  },
  "stay-with": {
    id: "stay-with",
    label: "Stay with them",
    moment: "stay with them",
    response: "Stay with them, so they are not on their own with it",
    icon: HandHeart,
  },
};

/* ------------------------------------------------------------ Step four */

/**
 * Each protective factor, phrased as a move rather than as a description.
 *
 * `PROTECTIVE_FACTORS[id].description` narrates what happened in a story that
 * has already finished. A quest draft needs the imperative version, so this is
 * that and nothing else. Keys are checked against the factor table by
 * `tests/unit/content.test.ts`, so a factor added without a move here fails
 * the build rather than generating a draft with a hole in it.
 */
export const QUEST_FACTOR_MOVES: Record<ProtectiveFactorId, string> = {
  "private-challenge": "ask the question away from the group, so answering it costs nobody face",
  "face-saving-exit": "give them a way to step back without losing face",
  "norm-corrected": "say out loud that you are not up for it, which is usually all it takes",
  "delay-inserted": "put a few minutes between the idea and the doing",
  "environment-changed": "change the situation so the safe option is the easy one",
  "adult-brought-in": "tell somebody who can actually do something about it",
  "shared-responsibility": "make it more than one person's job, so it is not down to who speaks first",
  "stayed-close": "stay close, so nobody is left on their own with it",
};

/** The four factors offered first. The rest sit behind "Something else". */
export const QUEST_PRIMARY_FACTORS: ProtectiveFactorId[] = [
  "norm-corrected",
  "face-saving-exit",
  "adult-brought-in",
  "environment-changed",
];

export const QUEST_SECONDARY_FACTORS: ProtectiveFactorId[] = [
  "private-challenge",
  "delay-inserted",
  "shared-responsibility",
  "stayed-close",
];

/* ---------------------------------------------------------- Generation */

export interface QuestChoiceSet {
  settingId: string;
  triggerId: string;
  decisionId: string;
  factorId: ProtectiveFactorId;
}

export interface GeneratedQuest {
  title: string;
  hook: string;
  moment: string;
  response: string;
}

/**
 * Assembles a draft from four ids.
 *
 * Deterministic and total: unknown ids fall back to the first entry rather
 * than throwing, because a persisted draft written by an older build must
 * still render after this table changes. Nothing here is generative in the
 * sense a reader might assume, and the screen says so.
 */
export function generateQuestDraft(choices: QuestChoiceSet): GeneratedQuest {
  const setting =
    QUEST_SETTINGS.find((entry) => entry.id === choices.settingId) ?? QUEST_SETTINGS[0];
  const trigger =
    QUEST_TRIGGERS.find((entry) => entry.id === choices.triggerId) ?? QUEST_TRIGGERS[0];
  const decision =
    QUEST_DECISIONS[choices.decisionId] ?? QUEST_DECISIONS[trigger.decisionIds[0]];
  const move = QUEST_FACTOR_MOVES[choices.factorId] ?? QUEST_FACTOR_MOVES["norm-corrected"];

  /*
   * The moment names the real branch, with the author's chosen decision last.
   *
   * Two alternatives, not three: "Do you go along, walk away, ask the staff,
   * bring in somebody who can help, or say something privately?" is a sentence
   * nobody finishes reading. The alternatives come from the trigger's own
   * ordered list, so they are always ones that make sense of the situation.
   */
  const alternatives = trigger.decisionIds
    .filter((id) => id !== decision.id)
    .map((id) => QUEST_DECISIONS[id])
    .filter(Boolean)
    .slice(0, 2);

  const branch = [...alternatives.map((entry) => entry.moment), decision.moment];
  const moment =
    branch.length > 1
      ? `Do you ${branch.slice(0, -1).join(", ")}, or ${branch[branch.length - 1]}?`
      : `Do you ${branch[0]}?`;

  return {
    title: `${trigger.titleHead} ${setting.titleTail}`,
    hook: trigger.hook.replace("{where}", setting.where),
    moment,
    response: `${decision.response}, and ${move}.`,
  };
}

/** The longest a player's own added line may be. One line, not a paragraph. */
export const CUSTOM_DETAIL_MAX = 120;
