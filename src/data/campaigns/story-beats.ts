import type { StorySegment } from "@/types/campaign";

/**
 * Short decision beats used by the follow-up chapters.
 *
 * A follow-up is deliberately small: one situation, one choice, one honest
 * response. It has to be finishable on a bus, a day or a week after the event,
 * by somebody who has half forgotten the story. That is the whole point of it.
 */

export interface StoryBeatOption {
  id: string;
  label: string;
  response: { headline: string; body: string };
}

export interface StoryBeat {
  id: string;
  setup: StorySegment;
  question: string;
  options: StoryBeatOption[];
  /** Shown to everybody afterwards. */
  closing: string;
}

export const STORY_BEATS: Record<string, StoryBeat> = {
  aftermath: {
    id: "aftermath",
    setup: {
      slug: "Monday, 7:30am",
      lines: [
        "Ilyas made the call. His mother came with him, which he did not expect and has not stopped mentioning.",
        "Ken has been quiet all morning. He was the one who said take it.",
      ],
      messages: [
        { from: "Ken", text: "i didnt think it was real" },
        { from: "Ken", text: "do you think he blames me" },
      ],
    },
    question: "What do you say to Ken?",
    options: [
      {
        id: "not-your-fault",
        label: "It is not your fault, drop it",
        response: {
          headline: "Kind, and it ends the conversation",
          body:
            "Reassurance is the easy thing to give and it closes the subject before anything changes. Ken walks away feeling better and having learned nothing, which is roughly how these things usually go.",
        },
      },
      {
        id: "say-it-next-time",
        label: "Next time say the quiet thing instead of the loud thing",
        response: {
          headline: "You gave him something to do",
          body:
            "This is the useful version. It does not litigate whose fault it was, and it leaves him with one concrete change he can actually make the next time somebody in the group says take it.",
        },
      },
      {
        id: "ask-him",
        label: "Ask him what he would say if it happened again today",
        response: {
          headline: "You made him rehearse it",
          body:
            "Getting somebody to say the sentence out loud is worth more than telling them the sentence. It is the same mechanism the first chapter used on you.",
        },
      },
    ],
    closing:
      "The day after is when this is decided. Not during, when everyone is defensive, and not a month later, when it is a story.",
  },

  "one-week-later": {
    id: "one-week-later",
    setup: {
      slug: "The following Thursday",
      lines: [
        "Different group chat. Someone you barely know posts a job.",
        "Three hundred a day, phone only, start this week. Two people have already replied asking for details.",
        "Nobody is going to mention Ilyas.",
      ],
      messages: [
        { from: "Unknown", text: "flexible hours, paid daily, dm me" },
        { from: "Someone", text: "interested" },
      ],
    },
    question: "What do you do?",
    options: [
      {
        id: "ignore",
        label: "Ignore it, not your group",
        response: {
          headline: "Costs you nothing, changes nothing",
          body:
            "Perfectly reasonable and completely passive. The two people who already replied are still going to reply.",
        },
      },
      {
        id: "post-signal",
        label: "Post one line about what the signals are",
        response: {
          headline: "You interrupted the default",
          body:
            "One sentence in a chat is the cheapest intervention that exists, and in a group where nobody has said anything yet, it is the one that changes what feels normal. It does not have to be a lecture.",
        },
      },
      {
        id: "dm-them",
        label: "Message the two who replied, privately",
        response: {
          headline: "The version that protects their standing",
          body:
            "Same content, no audience. Harder to dismiss and impossible to be embarrassed by, which is the whole reason it lands. It is the lesson from chapter one, applied without any story attached.",
        },
      },
    ],
    closing:
      "A week later, with no narration and no station to scan, the pattern either shows up or it does not. That is the only test that matters.",
  },
};

export function getStoryBeat(id: string): StoryBeat | undefined {
  return STORY_BEATS[id];
}
