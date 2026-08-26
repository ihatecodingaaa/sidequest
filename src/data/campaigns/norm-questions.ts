import type { NormQuestion } from "@/data/norm-mirror";

/**
 * ONE BAD MINUTE, chapter 2. Runs on the existing Norm Mirror mechanic.
 *
 * DATA HONESTY. Every `demoAggregate` below is synthetic. These are
 * placeholders shaped to demonstrate the mechanism and they are NOT findings
 * about Singapore youth. The UI labels them "Demo aggregate" and "Prototype
 * data" on every single reveal, and the chapter carries the same note.
 *
 * The direction of the gap is the grounded part: the social norms literature
 * repeatedly finds people overestimate how many of their peers take a risk,
 * and that the overestimate is itself part of what makes the risk feel normal.
 * The magnitudes are ours.
 *
 * Three questions rather than four, because this is played standing up at a
 * roadshow and the chapter has to fit inside about two minutes.
 */

export const EVERYONE_WOULD_QUESTIONS: NormQuestion[] = [
  {
    id: "obm-norm-account",
    situation:
      "Ilyas got offered three hundred dollars to let someone use his bank account once. Ken told him to take it.",
    behaviour: "Take the money and let someone use your account, once.",
    choiceYes: "Most people would take it",
    choiceNo: "Most people would refuse",
    demoAggregate: 9,
    insight:
      "This is the gap the whole chapter turns on. Three hundred dollars sounds like something anybody would take, so it feels like the normal answer. Far fewer people say they actually would.",
    action:
      "If it feels like everyone would say yes, that feeling is doing more work than the offer is.",
  },
  {
    id: "obm-norm-silent",
    situation:
      "You are standing there while a friend does something you think is a bad idea. Two other people are watching and nobody says anything.",
    behaviour: "Stay quiet in the moment.",
    choiceYes: "I'd stay quiet",
    choiceNo: "I'd say something",
    demoAggregate: 41,
    insight:
      "Usually the widest gap in the whole set. Everyone assumes everyone else stays quiet, which is exactly what makes staying quiet feel like the default rather than a decision.",
    action:
      "You do not need a speech. Pulling someone aside is a complete intervention and costs nobody any standing.",
  },
  {
    id: "obm-norm-forward",
    situation:
      "The same offer gets forwarded into a group chat you are in. It has not been checked by anyone.",
    behaviour: "Pass it on without checking it.",
    choiceYes: "I'd forward it",
    choiceNo: "I'd check it first",
    demoAggregate: 19,
    insight:
      "Forwarding feels generous rather than risky, so the cost of being wrong never enters the decision at all.",
    action: "Checking once protects everyone downstream of you. Forwarding unchecked makes you part of the distribution.",
  },
];

export const CAMPAIGN_NORM_SETS: Record<string, NormQuestion[]> = {
  "everyone-would": EVERYONE_WOULD_QUESTIONS,
};
