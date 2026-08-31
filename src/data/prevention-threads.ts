import type { DataProvenance, SkillId } from "@/types/core";
import type { HotspotSpot, OrderCard } from "@/types/interaction";
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
 *
 * ---
 *
 * ## Why there is more than one interaction here now
 *
 * Every step used to end the same way: read two lines, tap Continue, tap one
 * of four choice cards. That is a good interaction, and four of them in a row
 * is the shape testers were describing when they said the tasks felt like a
 * quiz. The problem was never that choosing is bad; it was that choosing was
 * the only thing on offer.
 *
 * So a step now declares which interaction the narrative wants:
 *
 *   world-talk      somebody tells you something. Continue.
 *   trusted-adult   somebody who knows what happens next tells you. Continue.
 *   decision        choice cards, with a consequence for whichever is taken.
 *   hotspot         tap the part of a place that is making the wrong thing
 *                   easy. This is situational prevention, and it is the only
 *                   mechanic that puts the environment rather than a person in
 *                   the player's hands.
 *   order           put two to four moves in sequence, where the sequence is
 *                   the lesson. Tap to place, never drag.
 *   hero-mission    hand off to the existing catalogue player.
 *   reflection      what happened afterwards. Continue.
 *
 * The rule is that the story picks the mechanic. A mechanic used because the
 * previous step used a different one is variety for its own sake, and it reads
 * as exactly that.
 */
export type ThreadStepKind =
  | "world-talk"
  | "trusted-adult"
  | "decision"
  | "hotspot"
  | "order"
  | "hero-mission"
  | "reflection";

export interface ThreadChoice {
  id: string;
  label: string;
  /** Deterministic consequence. Honest, never a verdict, never "wrong". */
  outcome: string;
  /**
   * The move that would have worked better, for an option that is riskier.
   *
   * Required on every option not marked `isSafest`, and a unit test enforces
   * it. Two separate reasons, and they point the same way.
   *
   * The brief's own rule is that refusing to score a choice is not the same as
   * pretending every choice is equally safe. The feedback literature is
   * sharper than that: Kluger and DeNisi's moderator analysis found that
   * supplying the correct solution is what separates a feedback intervention
   * that works from one that barely does, Shute's synthesis puts elaborated
   * feedback well above knowledge of the correct response and both well above
   * knowing only the result, and Fong's moderator analysis found that an
   * instructional detail naming the thing to do instead is the single feature
   * that flips negative feedback from demotivating to motivating.
   *
   * The ordering rule that follows is the important one: a consequence for a
   * risky option must never END on the harm. Fear without an efficacy
   * component is the Scared Straight shape, which is the one prevention
   * approach with evidence of making outcomes worse. So `outcome` carries what
   * happened and this carries what to do instead, and the interface always
   * renders them in that order.
   *
   * Phrased as an action somebody could actually perform in a real room, never
   * as a verdict on the person who chose.
   */
  safer?: string;
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
  /**
   * For `hotspot` steps. The scene, and what is worth finding in it.
   *
   * `sceneId` names an original SVG drawn in `scene-art.tsx`. The artwork is
   * decorative and `aria-hidden`; the spots are real buttons with real
   * accessible names, so nothing here depends on being able to see it.
   */
  hotspot?: {
    sceneId: "minimart-floor";
    prompt: string;
    spots: HotspotSpot[];
    /** How many of the counting spots are needed before the step can close. */
    required: number;
    /** Shown once the requirement is met. One line. */
    resolution: string;
  };
  /** For `order` steps. Two to four cards, and what the sequence teaches. */
  order?: {
    prompt: string;
    cards: OrderCard[];
    /**
     * The sequence the evidence supports, as card ids.
     *
     * Not a right answer to be marked. The debrief names what this order
     * produces and what a different one produces, in the same voice a choice
     * consequence uses, and no order costs anything.
     */
    recommended: string[];
    /** Shown when the player's sequence matches. */
    matched: string;
    /** Shown when it does not. Honest about the difference, never a verdict. */
    differed: string;
  };
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
    /**
     * The if-then plan offered at the end.
     *
     * A choice card is not an implementation intention: it supplies a response
     * inside a fictional situation the player will never stand in, and the
     * evidence is specific that the cue is the half that does the work. So the
     * thread supplies candidate cues drawn from the player's actual life, the
     * response is whichever option they took at the decision step, and the two
     * are shown joined. See `PlanReveal` for the sources.
     *
     * Optional: a thread with no decision step has no response to plan with.
     */
    plan?: {
      prompt: string;
      cues: { id: string; label: string }[];
    };
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
          safer:
            "Say no and hand him somewhere to go with it, so the next person he asks is not the one carrying it.",
        },
        {
          id: "warn-quietly",
          label: "Say nothing to him, warn Devi privately",
          outcome:
            "Devi is safe. Haziq keeps going, and the next person he asks does not have anybody warning them.",
          safer:
            "Warn Devi, then say the same thing to him directly. One conversation covers everybody after her.",
        },
        {
          id: "help-once",
          label: "Offer to use your own account instead, just once",
          outcome:
            "Now it is your name on it. The first transfer is often real, which is exactly what makes the second request easier to agree to.",
          safer:
            "Keep your account out of it entirely, and point him at the youth service Ms Sumi runs.",
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
    plan: {
      prompt: "When would this actually come up for you?",
      cues: [
        { id: "asked-me", label: "Someone asks to use my account" },
        { id: "asked-friend", label: "A friend tells me they were asked" },
        { id: "easy-money", label: "Someone offers easy money for something small" },
      ],
    },
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
          safer:
            "Get Elle away from it first, then call it in from inside the shop.",
        },
        {
          id: "film",
          label: "Get closer and film it",
          outcome:
            "You now have a video and Elle is still standing there. Filming is not helping, and holding up a phone is one of the things that escalates a scene fastest.",
          safer:
            "Put the phone down and walk with her to the shop. If somebody is in danger, 999 from in there.",
        },
      ],
      followUp:
        "There is no version of this where chasing anybody, holding anybody, or following anybody home is the answer.",
      skillId: "peer-intervention",
      xp: THREAD_XP.step,
    },
    /*
     * The order step, and the reason the mechanic exists at all.
     *
     * This thread's takeaway is a *sequence*: distance, then support, then the
     * people whose job it is. It used to be delivered as a sentence at the end
     * of a paragraph, which is the weakest possible way to teach an order. It
     * is now the thing the player does, at the moment they have just lived it,
     * which is retrieval practice on the one piece of content in this thread
     * that has to survive contact with a real street.
     *
     * There is no wrong sequence. A different order gets an honest account of
     * what it produces, in exactly the voice a choice consequence uses.
     */
    {
      id: "step-route",
      kind: "order",
      mode: "connect",
      npcId: "npc-hana",
      title: "Learn the route before you need it",
      lines: [
        "I called it in. You did the part that mattered, which was getting her in here.",
        "If it happens again, what comes first?",
      ],
      order: {
        prompt: "Put them in the order you would actually do them.",
        cards: [
          { id: "distance", label: "Get distance, and take them with you" },
          { id: "check", label: "Check they are okay" },
          { id: "help", label: "Tell someone whose job it is" },
        ],
        recommended: ["distance", "check", "help"],
        matched:
          "That is the order. Distance first, because everything else is easier from somewhere safe, and because nothing after it requires you to be brave.",
        differed:
          "It can work. Doing anything else first leaves both of you standing in it while you do, and the call is easier to make from inside the shop than from the edge of an argument.",
      },
      skillId: "communication",
      xp: THREAD_XP.step,
      official: "police-sms",
    },
  ],
  completion: {
    title: "The shout",
    takeaway: "Distance, then support, then the people whose job it is. In that order.",
    worldChange: "Elle is sitting inside the shop with Hana. The court is quiet again.",
    plan: {
      prompt: "When would this actually come up for you?",
      cues: [
        { id: "argument", label: "An argument near me stops being an argument" },
        { id: "friend-stuck", label: "Somebody I know is stuck in the middle of it" },
        { id: "late-alone", label: "It is late and the person with me wants to stay" },
      ],
    },
  },
};

/* --------------------------------------------------------- The last two */

/**
 * The Track B thread.
 *
 * Peer pressure and shop theft, which is the everyday version of what this
 * product is actually about: an ordinary young person, a few seconds, and
 * somebody watching to see what they do. Every risk factor the Delta Track B
 * brief names operates here, and none of them is a scam.
 *
 * ---
 *
 * ## It is also the interaction variety proof
 *
 * Three steps, three mechanics, three places, three people:
 *
 *   Mira, at the void deck   somebody tells you something.
 *   Lek, inside the shop     you tap the place that is making it easy.
 *   Kai, at the court        you decide what to say.
 *
 * The middle step is the one that could not have existed before this pass. It
 * is the only place in Streets where the player changes their model of a
 * situation rather than of a person, which is the whole of situational crime
 * prevention and the thing BREAKSAFE teaches at mission length. Here it takes
 * about twenty seconds.
 *
 * ## Written for the younger band
 *
 * The other two threads in the district are post-secondary. This one is
 * secondary, and the lines are in that register throughout rather than
 * carrying a second copy of themselves, because a thread whose whole audience
 * is thirteen to fifteen should simply be written for them.
 */
const THE_LAST_TWO: PreventionThread = {
  id: "thread-last-two",
  title: "The last two",
  hook: "Kai keeps walking out of Sunrise with more than he paid for.",
  mode: "redirect",
  playMode: "solo",
  audienceBand: "secondary",
  estimatedMinutes: 5,
  provenance: "seeded",
  capabilityIds: ["peer-intervention", "safety-design", "decision-making"],
  source: {
    label: "Singapore Police Force youth advisory, ages 13 to 19",
    body: "SPF tells this age group directly that being part of a group that is shoplifting makes a person equally liable, whether or not they were the one holding anything. Self checkout areas are recorded, and what happens next is decided from that footage rather than at the machine.",
  },
  steps: [
    {
      id: "step-notice",
      kind: "world-talk",
      mode: "connect",
      npcId: "npc-mira",
      title: "Hear what Mira noticed",
      lines: [
        "Kai does it at Sunrise. Every time, the last two things.",
        "He says nobody notices. I think he is right, and that is the bit that worries me.",
      ],
      skillId: "decision-making",
      xp: THREAD_XP.step,
    },
    /*
     * The hotspot step.
     *
     * Lek asks for help with the shop, not with Kai. That framing is the whole
     * point: the question a prevention product should be able to ask is what
     * about this place is making the wrong thing easy, and it is a question
     * that can be answered without guessing anything about anybody.
     *
     * Two of the five spots are decoys, and both are the things people reach
     * for first. They are tappable on purpose. BREAKSAFE established that
     * refusing an option after reading its trade-offs teaches more than never
     * being offered it.
     */
    {
      id: "step-shopfloor",
      kind: "hotspot",
      mode: "prevent",
      npcId: "npc-lek",
      title: "Find what makes it easy",
      lines: [
        "You are on the Crew, right? Then help me with the shop, not with him.",
        "Something in here is doing half the work. Show me.",
      ],
      hotspot: {
        sceneId: "minimart-floor",
        prompt: "Tap what is making the wrong thing easy.",
        required: 3,
        resolution:
          "Three things, and none of them is a person. That is what a prevention crew is actually for.",
        spots: [
          {
            id: "blocked-view",
            label: "The stack in front of the counter",
            x: 38,
            y: 46,
            counts: true,
            finding: "Nobody at the counter can see the last aisle",
            explanation:
              "A promotional stack went up and took the sightline with it. Nothing was decided about it. It is just where the boxes fitted.",
          },
          {
            id: "unattended",
            label: "The self checkout bank",
            x: 73,
            y: 62,
            counts: true,
            finding: "Two machines, and nobody standing near them",
            explanation:
              "One person covers the counter and the machines at once. At the busy hour that means the machines are alone, and everybody can tell.",
          },
          {
            id: "no-feedback",
            label: "The checkout screen",
            x: 73,
            y: 40,
            counts: true,
            finding: "The screen never says what it has",
            explanation:
              "Two grey words for a scan and no running basket. Somebody who is unsure has no cheap way to check, so an honest mistake and a deliberate one look identical.",
          },
          {
            id: "camera",
            label: "The camera",
            x: 52,
            y: 11,
            counts: false,
            finding: "A camera does not make anything harder",
            explanation:
              "It records what already happened. It changes nothing about the moment somebody is standing there deciding, and it treats everybody in the shop as a subject.",
          },
          {
            id: "warning-sign",
            label: "The warning poster",
            x: 17,
            y: 20,
            counts: false,
            finding: "A poster is not a design change",
            explanation:
              "Signs threatening consequences are cheap, which is why they are everywhere and why they stop being read. Making the honest path easy beats telling people off in advance.",
          },
        ],
      },
      skillId: "safety-design",
      xp: THREAD_XP.step,
    },
    {
      id: "step-say",
      kind: "decision",
      mode: "redirect",
      npcId: "npc-kai",
      title: "Say something to Kai",
      lines: [
        "You went in and talked to Lek. About me, is it.",
        "It is two things. Nobody is hurt.",
      ],
      choices: [
        {
          id: "private-and-out",
          label: "Say it privately, and leave him a way to stop",
          outcome:
            "He is annoyed, then quiet, and on Thursday he does not do it. Nothing was announced in front of anybody, so there was nothing for him to defend.",
          isSafest: true,
        },
        {
          id: "liability",
          label: "Tell him what it means for you too",
          outcome:
            "He had not thought about that part. Being in the group is enough to be liable, and hearing it from a friend lands differently than reading it on a poster.",
          isSafest: true,
        },
        {
          id: "stop-going",
          label: "Stop going to the shop with him",
          outcome:
            "It keeps you out of it. He keeps going, with somebody who has not thought about any of this, and nothing about the shop has changed.",
          safer:
            "Say it to him once, privately, before you stop going. It costs one conversation.",
        },
        {
          id: "laugh",
          label: "Leave it. It is two things",
          outcome:
            "It stays two things until it is not. The shop decides what happens next from the footage, later, and nobody at the machine gets a say in that.",
          safer:
            "Tell him what being in the group means for you, quietly, the next time you are on your own.",
        },
      ],
      followUp:
        "Nobody in this is a criminal. One of them is fifteen and has found something that works.",
      skillId: "peer-intervention",
      xp: THREAD_XP.step,
    },
  ],
  completion: {
    title: "The last two",
    takeaway: "Change the shop and talk to the friend. Doing one without the other is half a fix.",
    worldChange: "The stack by the counter has moved, and Kai is at the court instead.",
    plan: {
      prompt: "When would this actually come up for you?",
      cues: [
        { id: "watching", label: "A friend does it while I am standing there" },
        { id: "told-after", label: "Someone tells me about it afterwards" },
        { id: "asked-along", label: "I get asked to come along" },
      ],
    },
  },
};

export const PREVENTION_THREADS: PreventionThread[] = [
  THE_FAVOUR,
  THE_SHOUT,
  THE_LAST_TWO,
];

/**
 * The option the player took at this thread's decision step.
 *
 * Reads the choice ledger rather than the content, because the whole point of
 * an if-then plan is that the response half is theirs. Returns the last
 * decision they made, so a thread with more than one branch plans with the
 * most recent. Null when no decision has been recorded, which is why
 * `PlanReveal` is only rendered when there is something to plan with.
 */
export function chosenResponse(
  thread: PreventionThread,
  choices: Record<string, string>,
): string | null {
  for (let i = thread.steps.length - 1; i >= 0; i -= 1) {
    const step = thread.steps[i];
    const taken = choices[stepKey(thread.id, step.id)];
    if (!taken) continue;
    const choice = step.choices?.find((entry) => entry.id === taken);
    if (choice) return choice.label;
  }
  return null;
}

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
