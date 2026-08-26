# Focal point audit

One question per screen, one obvious next action.

Conducted 26 August 2026 against the build at commit `f43707a`, prompted by
user testing rather than by an automated audit. The two passes before this one
were green, and they were green because accessibility and hierarchy tests
measure whether a screen is usable. They cannot measure whether a person can
tell what to do with it in two seconds.

The test applied to every screen below: **shown for about two seconds, can
somebody say what the obvious next action is?** Where the answer was no, the
fix used size, position, contrast and whitespace. Never motion: an element that
pulses to attract the eye is a hierarchy failure wearing a costume.

---

## Measured before and after

`node scripts/tap-audit.mjs`, written for this pass. Two numbers, and neither is
"smaller is better" alone.

- **taps**: presses before the first real decision.
- **worst step**: the most new words that ever arrive between two presses.

Worst step is the one that matches the complaint. Total words on screen is the
wrong measure, because revealed lines accumulate on purpose so a scene can be
re-read, so the end state barely moves under segmenting.

| Journey | Taps before | Taps after | Worst step before | Worst step after |
| ------- | ----------: | ---------: | ----------------: | ---------------: |
| ONE BAD MINUTE, chapter 1 | 4 | 8 | 45w | **26w** |
| REWIND | 2 | 7 | 44w | **36w** |
| Crew Shift | 4 | 9 | 46w | **29w** |

Taps roughly doubled. That is the intended trade and it is worth stating
plainly: the player presses more often and reads far less each time. The guard
rail against overcorrection was the "one beat, one idea" rule, and it moved
real numbers: an early version of chapter 1 reached **13** taps by giving every
sentence its own beat, which is the bureaucracy the brief warns about. Merging
tightly coupled lines and cutting one genuinely duplicated screen brought it to
8.

**The most useful finding came from the measurement, not from the design.** The
worst reading load in chapter 1 was never a story beat. It was the chapter
unlock screen, at 45 words, and it stayed at 45 words after every story beat had
been segmented. The story had been fixed and the metric had not moved. What
actually needed cutting was the furniture around the story.

Story beats now deliver 12 to 18 words per press, measured directly.

---

## Screen by screen

### Home

- **Primary question:** what should I do now?
- **First focal point:** the Campaign hero.
- **Primary action:** continue or start ONE BAD MINUTE.
- **Secondary:** the three signature missions, crew, one story, radio.
- **Problem:** none found. The previous pass rebuilt this around one hero and it
  passes the two-second test.
- **Change:** none. Signature missions gained recognition marks, which is a
  Missions change that shows up here.

### Updates

- **Primary question:** what is worth knowing?
- **First focal point:** the lead story, in large type with no card around it.
- **Primary action:** play the mission attached to it.
- **Problem:** the tester word was "dull". The hierarchy is right, so this is a
  texture problem rather than a structure problem.
- **Change:** none this pass, and this is the largest thing left undone. Adding
  imagery here needs each image to carry information about its story, and
  inventing an illustration per story is exactly the "no visual without a job"
  line. Recorded as the top remaining concern rather than solved badly.

### Missions

- **Primary question:** what can I play?
- **First focal point:** the Campaign hero, then "Start here".
- **Primary action:** open a signature mission.
- **Problem:** the three signature cards were text-only and identical in shape,
  labelled "Signature", which tells a first-time reader nothing about which
  mission is which.
- **Change:** each signature mission gained an original SVG **mission mark**, an
  abstract diagram of what the mission does: two paths from one point for
  REWIND, two bars at very different heights for Norm Mirror, a grid with one
  cell changed for BREAKSAFE. The job is recognition before reading. The word
  "Signature" was replaced by the mark rather than added to.

### Campaign

- **Primary question:** where am I and what is next?
- **First focal point:** a card naming the next chapter.
- **Primary action:** **Continue**, with the chapter's actual title above it.
- **Problem:** this was the most specific tester complaint, and it was correct.
  The answer to "what next" was only *derivable*: four identically sized chapter
  cards distinguished mainly by the colour of a 24px dot, plus a progress bar, a
  finale sentence, a station code form and a follow-up list.
- **Change:** the next step is lifted out of the list into the largest control
  on the screen. Node states are now carried by four things at once, so any one
  of them is enough: **shape** (filled, ringed, outlined, dashed), **icon**
  (tick, play, number, padlock), **label** (a word on the row), and **position**
  (current is above the map entirely). The description dropped from five
  sentences to one line. Echo stopped repeating the next chapter's name, which
  the Continue control now says far more loudly, and says the thing the control
  cannot: a busy station is not a blocker.

### Campaign chapter entry, after a QR scan

- **Primary question:** did the scan work, and what do I do with my body?
- **First focal point:** "Chapter N unlocked".
- **Primary action:** start the chapter.
- **Problem:** the heaviest reading load in the whole chapter. Chapter chip,
  provenance tag, unlock badge, title, description, a boxed congestion
  instruction with its own heading, the brief, and a metadata row.
- **Change:** three things only. It worked, what this chapter is, and move away
  from the station. The brief moved into the story it introduces. The provenance
  tag moved to the Campaign screen, where the Campaign is actually described and
  where the declare-once-per-screen rule is satisfied.

### REWIND, Norm Mirror, BREAKSAFE, Crew Shift

- **Primary question:** what happens next in this scene?
- **First focal point:** the newest line.
- **Primary action:** one advance control, in the same place every time.
- **Problem:** whole scenes printed at once, three paragraphs and a small
  button, no speaker, no pacing.
- **Change:** `StoryBeat`. One idea per press, speaker named in text with a
  portrait beside it, choices withheld until the scene has finished so nobody is
  asked a question they have not read to the end of. Exactly one advance
  control: the intro used to have a footer button *and* would have gained an
  inline one, which is two ways to do the same thing, one of them silently
  skipping the scene.
- **Debriefs:** the behavioural mechanism moved behind a "Why this works"
  disclosure. The visible debrief is what changed, in plain language.

### Crew

- **Primary question:** what is my crew doing?
- **First focal point:** the crew card and the weekly challenge.
- **Change:** none. It passes.

### Rewards

- **Primary question:** what can I get?
- **First focal point:** the reward list.
- **Change:** none. It passes, and its honesty labelling is load-bearing.

### You

- **Primary question:** what have I done and unlocked?
- **First focal point:** the level ring.
- **Primary action:** none, and that is correct. This is a record, not a task.
- **Change:** the **Echo collection** was added below the Safety Passport.
  Deliberately below: what you can do outranks what your companion looks like.

### Safe

- **Primary question:** what help do I need?
- **First focal point:** "What do you need?", then Emergency.
- **Change:** **none, and none was permitted.** No Echo, no collection, no
  motion, no marks, no sound, no XP. Safe stays calm, direct and fast, and the
  rules protecting that are in `CLAUDE.md`.

---

## What this audit did not fix

Recorded so it is not mistaken for finished.

1. **Updates is still visually plain.** The hierarchy is right and the texture
   is not. Fixing it properly needs per-story imagery that carries information,
   which is a content problem rather than a layout one.
2. **The mission marks are small.** They give recognition, but they read as
   icons rather than as art. Whether that is enough to answer "dull" is a
   question for the next round of testers, not for me.
3. **Taps doubled.** Defensible, measured, and still the change most likely to
   annoy somebody who wanted the story to move faster rather than lighter.
