import type { StorySegment } from "@/types/campaign";

/**
 * CREW SHIFT, the Campaign-only peer mechanic.
 *
 * Everyone answers privately by passing one phone around, nobody sees anyone
 * else's answer until all of them are in, and then the group gets a short
 * window to argue about it and commit to one decision together.
 *
 * The behavioural point is that the mechanic makes peer influence visible.
 * There is no right answer and there is no score. What gets shown at the end
 * is simply whether the group ended up somewhere different from where its
 * members started, which is the thing worth noticing.
 */

export interface CrewShiftOption {
  id: string;
  label: string;
  /** Short line shown in the reveal, describing what this choice costs. */
  tradeoff: string;
}

export interface CrewShiftRound {
  id: string;
  title: string;
  situation: StorySegment;
  /** The question each member answers privately. */
  prompt: string;
  options: CrewShiftOption[];
  /** Prompts shown on screen during the discussion window. */
  discussionPrompts: string[];
  discussionSeconds: number;
  finalPrompt: string;
  /** Deterministic closing note per chosen option. Never a score. */
  outcomes: Record<string, { headline: string; body: string }>;
  /** Shown when the group decision differs from the majority of private ones. */
  shiftedNote: string;
  /** Shown when it does not. */
  heldNote: string;
  /** Shown in solo mode, where there is nobody to disagree with. */
  soloNote: string;
}

export const CREW_SHIFT_ROUNDS: Record<string, CrewShiftRound> = {
  "who-tells-ilyas": {
    id: "who-tells-ilyas",
    title: "Crew Shift",
    situation: {
      slug: "Saturday, 8:20pm",
      lines: [
        "Ilyas took the first offer. The money came, and nothing happened, and that is the problem.",
        "Now there is a second one, for more, and he has stopped mentioning it in the group chat.",
        "The four of you are outside, and he is inside getting drinks.",
      ],
      messages: [
        { from: "Ken", text: "he said he already did it once and it was fine" },
        { from: "Rina", text: "that is not the same as it being fine" },
        { from: "You", text: "so what do we do", isYou: true },
      ],
    },
    prompt: "You have about four minutes before he comes back. What should the group do?",
    options: [
      {
        id: "private",
        label: "One person talks to him alone, tonight",
        tradeoff: "Lowest cost to him. Depends entirely on that one person actually doing it.",
      },
      {
        id: "together",
        label: "All of you say something, together, now",
        tradeoff: "Hard to ignore. Also hard not to feel ganged up on.",
      },
      {
        id: "adult",
        label: "Tell someone older who can actually help",
        tradeoff: "Brings in real help. He may see it as going behind his back.",
      },
      {
        id: "watch",
        label: "Say nothing yet, stay close, see what happens",
        tradeoff: "Keeps the friendship easy. Also the option that changes nothing.",
      },
    ],
    discussionPrompts: [
      "Who is actually going to do it, and when?",
      "What happens if he says no?",
      "What would you want your friends to do if it were you?",
    ],
    discussionSeconds: 45,
    finalPrompt: "One decision, from all of you.",
    outcomes: {
      private: {
        headline: "One person, one conversation",
        body:
          "The quietest option and usually the most effective, because it lets him change his mind without an audience. It only works if the group agrees who is doing it before they walk back inside.",
      },
      together: {
        headline: "The whole group, at once",
        body:
          "It is much harder to wave off four people than one. It is also the version most likely to make him defend a position he has not fully committed to yet. Worth it if the alternative is nobody saying anything.",
      },
      adult: {
        headline: "Bringing in someone who can help",
        body:
          "The only option on this list that comes with actual assistance: freezing an account, dealing with a bank, handling what has already happened. It costs something in the friendship, and it is often still the right call.",
      },
      watch: {
        headline: "Staying close, saying nothing",
        body:
          "Honest about how these moments usually go. The group stays comfortable and the situation keeps moving. Worth asking what exactly you are waiting to see.",
      },
    },
    shiftedNote:
      "The group did not land where most of you started. That is what discussion does, and it is why crews decide differently from individuals.",
    heldNote:
      "The group held its position after talking it through. Agreeing after an argument is worth more than agreeing before one.",
    soloNote:
      "Played solo, so there was nobody to shift you. Run this one with friends when you can. The disagreement is the part that does the work.",
  },
};

export function getCrewShiftRound(id: string): CrewShiftRound | undefined {
  return CREW_SHIFT_ROUNDS[id];
}

/** Pass-the-phone supports a small group. More than four and nobody waits. */
export const MAX_CREW_PLAYERS = 4;
export const MIN_CREW_PLAYERS = 1;
