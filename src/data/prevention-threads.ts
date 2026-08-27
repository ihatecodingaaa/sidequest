import type { DataProvenance, SkillId } from "@/types/core";
import type { SignalMode } from "./signals";

/**
 * Prevention Threads.
 *
 * A Thread is a connected story across several people and more than one place,
 * where different people know different things and the player decides how to
 * act on what they learn.
 *
 * ---
 *
 * ## Why threads rather than more single encounters
 *
 * Wouters et al. (2013, J. Ed. Psych. 105(2): 249-265) report a learning effect
 * for serious games of d = 0.29, **no** motivational advantage over ordinary
 * instruction, and three moderators: supplementing other teaching, **multiple
 * sessions**, and group play.
 *
 * Two of those three are structural properties software can build rather than
 * claim. Multiple sessions is what a thread is: a story you are part way
 * through is a reason to come back that a completed quiz is not. Group play is
 * what `playMode: "crew"` is.
 *
 * ## Where a thread starts
 *
 * Before the risky behaviour, or at the very start of it. Every risk factor the
 * Delta Track B brief names (peer pressure, impulsive decisions, poor risk
 * awareness, wanting to be accepted, not seeing the consequence) operates
 * before an offence. None of them is addressed by investigating an aftermath,
 * so there is no crime scene in this product and no evidence to collect.
 *
 * ## What a thread never does
 *
 * It never reimplements a mission. A `hero-mission` step hands off to the
 * existing player through the existing route and picks up where it left off.
 */

/** Who a thread is written for. Aligned to how SPF bands its youth advisories. */
export type AudienceBand = "secondary" | "post-secondary";

/**
 * Whether this needs other people.
 *
 * Declared on the content and shown before opening, because a young person who
 * opens something alone and discovers it needs three friends has been wasted,
 * and a judge who does it has been misled.
 */
export type PlayMode = "solo" | "crew" | "either";

/**
 * What a step asks of the player.
 *
 * `hero-mission` is the bridge to the existing catalogue. Everything else runs
 * in the world's own dialogue sheet.
 */
export type ThreadStepKind =
  | "world-talk"
  | "trusted-adult"
  | "decision"
  | "hero-mission"
  | "reflection";

export interface ThreadChoice {
  id: string;
  label: string;
  /** Deterministic consequence. Honest, never a verdict, never "wrong". */
  outcome: string;
  /**
   * Marks the response the evidence supports.
   *
   * Not "the right answer": every option gets an honest outcome and none costs
   * XP. This exists so the debrief can name what worked, not so the player can
   * be scored.
   */
  isSafest?: boolean;
}

export interface ThreadStep {
  id: string;
  kind: ThreadStepKind;
  /** The mode of the signal this step raises. Describes the response needed. */
  mode: SignalMode;
  /** Whose position the marker sits at. */
  npcId: string;
  /** One short line for the Quest List and the HUD. */
  title: string;
  /**
   * What is said, one thought per line. Two lines maximum before the player
   * does something.
   */
  lines: string[];
  /** Younger-audience wording. Same step, same mechanism, different register. */
  linesSecondary?: string[];
  choices?: ThreadChoice[];
  /** Line shown after any choice, before the step closes. */
  followUp?: string;
  /** For `hero-mission` steps only: which existing mission to hand off to. */
  missionId?: string;
  /** Which existing capability this step builds. No new progression system. */
  skillId: SkillId;
  /** Steps are worth the same regardless of mode. See `THREAD_XP`. */
  xp: number;
  /** Optional extra conversation that adds context and grants nothing. */
  optional?: boolean;
  /**
   * An entry in `official-links.ts` to offer after the step.
   *
   * SIDEQUEST teaches the decision and links out. It never takes a report and
   * never restates an agency's page: the handoff is the point.
   */
  official?: string;
}

export interface PreventionThread {
  id: string;
  title: string;
  /** One line, on the card. What is happening, not what you will learn. */
  hook: string;
  /** The mode of the thread as a whole, for discovery surfaces. */
  mode: SignalMode;
  playMode: PlayMode;
  /** Only for crew threads. Shown before opening. */
  crewSize?: string;
  audienceBand: AudienceBand;
  estimatedMinutes: number;
  steps: ThreadStep[];
  /** Shown once every required step is banked. */
  completion: {
    title: string;
    takeaway: string;
    /** What visibly changes in the district afterwards. */
    worldChange: string;
  };
  /** Where the factual content comes from. Rendered after the interaction. */
  source: { label: string; body: string };
  provenance: DataProvenance;
  capabilityIds: SkillId[];
}

/**
 * XP bands.
 *
 * **`mode` never enters this table.** A Protect thread does not pay more than
 * a Connect one, because whatever pays most is what people go and do, and a
 * product that pays most for the most dangerous situation available has told a
 * sixteen year old exactly the wrong thing. `tests/unit/integrity.test.ts`
 * asserts that no XP figure in the content differs by mode.
 *
 * XP is banded by length and structure only.
 */
export const THREAD_XP = {
  /** One exchange. */
  touch: 15,
  /** One meaningful step inside a thread. */
  step: 30,
  /** Finishing a whole thread. */
  thread: 90,
} as const;

/* ------------------------------------------------------------ The Favour */

/**
 * The flagship. Five steps, four people, two places, one real branch.
 *
 * The factual spine is SPF's own advisory for 13 to 19 year olds, which says
 * plainly: "Never share your login details or let others use your accounts, no
 * matter how tempting the offer." The thread's job is to put that sentence
 * inside a social moment where saying no costs something, because that is the
 * only place it is difficult.
 */
const THE_FAVOUR: PreventionThread = {
  id: "thread-favour",
  title: "The favour",
  hook: "Devi's friend wants to borrow her bank login. Just for a week.",
  mode: "redirect",
  playMode: "solo",
  audienceBand: "post-secondary",
  estimatedMinutes: 6,
  provenance: "seeded",
  capabilityIds: ["peer-intervention", "communication", "decision-making"],
  source: {
    label: "Singapore Police Force youth advisory, ages 13 to 19",
    body: "SPF advises young people never to share login details or let others use their accounts. Letting someone move money through your account can make you a money mule, which is treated seriously even where the account holder says they did not know.",
  },
  steps: [
    {
      id: "step-hear",
      kind: "world-talk",
      mode: "connect",
      npcId: "npc-devi",
      title: "Hear what Devi was asked",
      lines: [
        "Haziq asked to use my bank login. Just for a week.",
        "He said he would owe me one. I have not said anything yet.",
      ],
      linesSecondary: [
        "Haziq asked if he could use my bank account.",
        "He said he'd owe me. I didn't say anything.",
      ],
      skillId: "decision-making",
      xp: THREAD_XP.step,
    },
    {
      id: "step-ask",
      kind: "world-talk",
      mode: "connect",
      npcId: "npc-joy",
      title: "Ask around before you answer",
      lines: [
        "Haziq asked me first. I said no and he went quiet.",
        "Someone is paying him to move money. He is not the one it lands on.",
      ],
      linesSecondary: [
        "He asked me first. I said no.",
        "Someone's paying him to move money through someone else's account.",
      ],
      skillId: "communication",
      xp: THREAD_XP.step,
    },
    {
      id: "step-adult",
      kind: "trusted-adult",
      mode: "connect",
      npcId: "npc-sumi",
      title: "Ask someone who knows what happens next",
      lines: [
        "The account holder is the one the bank calls. Every time.",
        "Saying you did not know is not the shield people think it is.",
      ],
      skillId: "communication",
      xp: THREAD_XP.step,
      optional: true,
    },
    {
      id: "step-choose",
      kind: "decision",
      mode: "redirect",
      npcId: "npc-rafi",
      title: "Say something to Haziq",
      lines: [
        "You heard already. It is one week, then I close it.",
        "Devi would have been fine. It is not a big thing.",
      ],
      linesSecondary: [
        "It's one week. Then I stop.",
        "Devi would've been fine with it.",
      ],
      choices: [
        {
          id: "no-plus-way-out",
          label: "No, and offer him a way out that is not the account",
          outcome:
            "He does not thank you. He does stop asking, and he takes the number for the place Ms Sumi mentioned. Refusing worked because you left him somewhere to go.",
          isSafest: true,
        },
        {
          id: "flat-no",
          label: "Just tell him no",
          outcome:
            "It lands. He shrugs it off and asks somebody else two days later. Saying no protected Devi and did nothing about the reason he is asking.",
        },
        {
          id: "warn-quietly",
          label: "Say nothing to him, warn Devi privately",
          outcome:
            "Devi is safe. Haziq keeps going, and the next person he asks does not have anybody warning them.",
        },
        {
          id: "help-once",
          label: "Offer to use your own account instead, just once",
          outcome:
            "Now it is your name on it. The first transfer is often real, which is exactly what makes the second request easier to agree to.",
        },
      ],
      followUp:
        "Nobody in this scene is a criminal mastermind. One of them is short of money and running out of ideas.",
      skillId: "peer-intervention",
      xp: THREAD_XP.step,
    },
    {
      id: "step-after",
      kind: "reflection",
      mode: "connect",
      npcId: "npc-devi",
      title: "Check back with Devi",
      lines: [
        "He asked me again. I said the same thing you said.",
        "It was easier the second time. I had the words ready.",
      ],
      skillId: "peer-intervention",
      xp: THREAD_XP.step,
    },
  ],
  completion: {
    title: "The favour",
    takeaway: "Refusing works better when the other person is left somewhere to go.",
    worldChange: "Devi is back at the void deck, and she has the words ready now.",
  },
};

/* ------------------------------------------------------------- The Shout */

/**
 * The one red thread in the district.
 *
 * Three steps, deliberately shorter than the amber one, so that the red thread
 * pays **less**. That is the incentive test this whole system has to survive:
 * if the most dangerous situation is the most rewarding, the product has told
 * a young person to go and find danger.
 *
 * Every safe response here is distance, support and getting help. None of the
 * options that involve going closer are rewarded, and the honest consequence
 * of each is stated without lecturing.
 */
const THE_SHOUT: PreventionThread = {
  id: "thread-shout",
  title: "The shout",
  hook: "Raised voices at the court, and one person has stopped talking.",
  mode: "protect",
  playMode: "solo",
  audienceBand: "post-secondary",
  estimatedMinutes: 4,
  provenance: "seeded",
  capabilityIds: ["peer-intervention", "communication"],
  source: {
    label: "Singapore Police Force contact channels, verified 27 August 2026",
    body: "999 is the emergency line. The Police also publish an emergency SMS number, 70999, described as being for immediate police assistance if it is not safe to talk. Non-emergency information goes to 1800 255 0000 or the I-Witness e-service. SIDEQUEST never takes a report itself.",
  },
  steps: [
    {
      id: "step-notice",
      kind: "world-talk",
      mode: "protect",
      npcId: "npc-elle",
      title: "Elle is at the edge of it",
      lines: [
        "It started as nothing. Now he will not let it go.",
        "I do not want to be the one who makes it worse.",
      ],
      skillId: "peer-intervention",
      xp: THREAD_XP.step,
    },
    {
      id: "step-act",
      kind: "decision",
      mode: "protect",
      npcId: "npc-elle",
      title: "Decide what you do",
      lines: ["You are close enough to do something. Not close enough to be in it."],
      choices: [
        {
          id: "walk-and-staff",
          label: "Walk with Elle to the shop and tell the staff",
          outcome:
            "You are both inside in twenty seconds, with an adult who can call it in. Distance first, then help. Nothing about this required you to be brave.",
          isSafest: true,
        },
        {
          id: "call",
          label: "Move back and call 999",
          outcome:
            "Correct if somebody is in danger, and it is the right number. Getting Elle away from it first would have taken you five seconds and made the call from somewhere safer.",
          isSafest: true,
        },
        {
          id: "step-between",
          label: "Step between them and tell them to stop",
          outcome:
            "It might work. It also puts a third person inside an argument that already has too many. Nobody trains for this, and the people who do it get hurt at a rate that is not worth it.",
        },
        {
          id: "film",
          label: "Get closer and film it",
          outcome:
            "You now have a video and Elle is still standing there. Filming is not helping, and holding up a phone is one of the things that escalates a scene fastest.",
        },
      ],
      followUp:
        "There is no version of this where chasing anybody, holding anybody, or following anybody home is the answer.",
      skillId: "peer-intervention",
      xp: THREAD_XP.step,
    },
    {
      id: "step-route",
      kind: "trusted-adult",
      mode: "connect",
      npcId: "npc-hana",
      title: "Learn the route before you need it",
      lines: [
        "I called it in. You did the part that mattered, which was getting her in here.",
        "999 if someone is in danger. If it is not safe to talk, the Police publish an SMS number.",
      ],
      skillId: "communication",
      xp: THREAD_XP.step,
      official: "police-sms",
    },
  ],
  completion: {
    title: "The shout",
    takeaway: "Distance, then support, then the people whose job it is. In that order.",
    worldChange: "Elle is sitting inside the shop with Hana. The court is quiet again.",
  },
};

export const PREVENTION_THREADS: PreventionThread[] = [THE_FAVOUR, THE_SHOUT];

export function getThread(id: string): PreventionThread | undefined {
  return PREVENTION_THREADS.find((thread) => thread.id === id);
}

export function getThreadStep(
  threadId: string,
  stepId: string,
): { thread: PreventionThread; step: ThreadStep } | undefined {
  const thread = getThread(threadId);
  const step = thread?.steps.find((entry) => entry.id === stepId);
  return thread && step ? { thread, step } : undefined;
}

/** Ledger key for one banked step. One key, one payment, ever. */
export function stepKey(threadId: string, stepId: string): string {
  return `${threadId}:${stepId}`;
}

/** Ledger key for finishing a thread. */
export function threadKey(threadId: string): string {
  return `${threadId}:complete`;
}

/**
 * The steps that must be banked before a thread is finished.
 *
 * Optional steps add context and grant XP the first time, but never gate
 * completion: a player who skips the trusted adult still finishes the story,
 * and one who talks to them learns something the others do not know.
 */
export function requiredSteps(thread: PreventionThread): ThreadStep[] {
  return thread.steps.filter((step) => !step.optional);
}
