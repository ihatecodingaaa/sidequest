/**
 * NORM MIRROR.
 *
 * DATA HONESTY, READ THIS BEFORE CHANGING ANYTHING HERE.
 *
 * Every number in `demoAggregate` is synthetic. It is a placeholder shaped to
 * demonstrate the mechanism, and it is NOT a finding about Singapore youth.
 * The UI labels it "Demo aggregate" on every single reveal, and the mission is
 * tagged `provenance: "demo-aggregate"` in the catalogue.
 *
 * The direction of the gap is the part that is grounded: the social norms
 * literature repeatedly finds that people overestimate how many of their peers
 * engage in a risky behaviour, and that the overestimate is itself part of what
 * makes the behaviour feel normal. The magnitudes below are invented.
 *
 * To replace this with real data: run the same questions as a survey, drop the
 * results into `demoAggregate`, set `sampleSize` and `sourceNote`, and flip the
 * mission's provenance. No component changes are required.
 */

export interface NormQuestion {
  id: string;
  /** Short scene, second person, no judgement in the framing. */
  situation: string;
  /** The behaviour being measured, phrased neutrally. */
  behaviour: string;
  /** Label for the "would do it" end of the personal choice. */
  choiceYes: string;
  /** Label for the "would not" end. */
  choiceNo: string;
  /** Synthetic percentage of peers who said they would do it. */
  demoAggregate: number;
  /** What the gap tends to mean. Explanatory, not scolding. */
  insight: string;
  /** The practical takeaway once the gap is visible. */
  action: string;
}

export const NORM_SAMPLE_NOTE =
  "Prototype data. These percentages are illustrative placeholders created for the SIDEQUEST prototype, not survey results.";

export const NORM_QUESTIONS: NormQuestion[] = [
  {
    id: "norm-account",
    situation:
      "A friend asks to use your bank account for one transfer. They say it is because their own account has a problem this week.",
    behaviour: "Let a friend receive money through your bank account, once.",
    choiceYes: "I'd probably let them",
    choiceNo: "I'd say no",
    demoAggregate: 11,
    insight:
      "Most people assume this is common because they can imagine saying yes to a friend. Far fewer say they actually would. The imagined version is the pressure.",
    action:
      "You can help without lending anything in your name. Offer to go with them to their bank instead.",
  },
  {
    id: "norm-otp",
    situation:
      "Someone in your group chat is locked out of their account. They ask you to receive a verification code for them and send it over.",
    behaviour: "Forward a verification code on behalf of a friend.",
    choiceYes: "I'd send it",
    choiceNo: "I wouldn't send it",
    demoAggregate: 17,
    insight:
      "This one feels harmless because the request comes from a friend, and because refusing feels like accusing them of something.",
    action:
      "Call them. If the account really is theirs, a thirty second call settles it. If it is not, the call ends the attempt.",
  },
  {
    id: "norm-silence",
    situation:
      "You are with three friends. One of them takes something small from a shop. Nobody else says anything.",
    behaviour: "Say nothing in the moment.",
    choiceYes: "I'd stay quiet",
    choiceNo: "I'd say something",
    demoAggregate: 38,
    insight:
      "This gap is usually the largest one. People assume almost everybody stays quiet, which makes staying quiet feel like the normal thing to do. The assumption does more work than the situation does.",
    action:
      "You do not need a speech. Suggesting everyone leave is a complete intervention and costs nobody any face.",
  },
  {
    id: "norm-forward",
    situation:
      "A high paying part time job link gets sent to you. You have not checked it, but it looks like it could be useful to a few people.",
    behaviour: "Forward it to friends without checking it first.",
    choiceYes: "I'd forward it",
    choiceNo: "I'd check it first",
    demoAggregate: 23,
    insight:
      "Forwarding feels generous rather than risky, so the cost of being wrong is not part of the decision at all.",
    action:
      "Check it once and you protect everyone downstream of you. Forwarding unchecked makes you part of the distribution.",
  },
];

/** Sizes the "what you guessed" versus "what they said" comparison bars. */
export const NORM_MAX_PERCENT = 100;
