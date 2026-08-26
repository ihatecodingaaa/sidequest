"use client";

import { StoryBeat, useStoryBeat, type StoryBeatState } from "@/components/story/story-beat";
import type { StorySegment } from "@/types/campaign";
import type { StoryLineInput } from "@/types/story";

/**
 * A campaign story segment, played rather than printed.
 *
 * This used to render every line at once, which is what the testers meant by
 * "too many words": chapter one opened with three paragraphs and one small
 * button. It now reveals one idea at a time at the player's pace, which is
 * segmenting rather than a word cut. The words are mostly the same words.
 *
 * Message exchanges are appended to the end of the scene. A chat thread is one
 * artefact and drip-feeding it line by line would read as affectation.
 */
export function segmentLines(segment: StorySegment): StoryLineInput[] {
  const messages = segment.messages ?? [];
  return messages.length > 0
    ? [...segment.lines, { kind: "thread" as const, messages }]
    : [...segment.lines];
}

/** Hook form, for hosts that render their own advance control in a footer. */
export function useSegment(segment: StorySegment): StoryBeatState {
  return useStoryBeat(segmentLines(segment));
}

export function StoryView({
  segment,
  beat,
  className,
}: {
  segment: StorySegment;
  beat: StoryBeatState;
  className?: string;
}) {
  return <StoryBeat beat={beat} slug={segment.slug} className={className} />;
}
