# Audio art direction

What SIDEQUEST is allowed to sound like, and why every sound in it is a number
rather than a recording.

**Written:** 1 September 2026, for the pass that gave the world sound.

---

## The rule everything else follows

**Every sound is synthesised at runtime. There are no audio files.**

Not one. Every cue, every ambience layer and every note of the music is
generated from oscillators and a noise buffer by `src/lib/audio/`. A unit test
fails the build if an audio file appears anywhere in `src` or `public`, if any
component constructs an `Audio` element or an `AudioContext`, or if the engine
is statically imported outside its own directory.

That single decision answers four separate problems at once:

**Provenance.** A synthesised triangle wave cannot contain somebody else's
recording. There is nothing to license, nothing to attribute, nothing that
could have been downloaded from a pack of uncertain origin, and no route by
which a sample from another game arrives by accident. `docs/ASSET_LICENSES.md`
has no audio entry because there is no audio asset.

**Weight.** A PWA that has to open on a roadshow phone over bad wifi should not
ship a megabyte of loops. The whole audio system is a few kilobytes of
JavaScript behind a dynamic import, so Home, Updates and Safe download none of
it.

**Latency, which turns out to be a hard requirement rather than a nice
property.** Kaaresoja, Brewster and Lantz (2014) measured the point of
subjective simultaneity for audio feedback after a touch at about 19ms, found
perceived button quality dropping significantly once audio lags by 70 to 100ms,
and found 300ms rated significantly worse than every shorter condition. Their
published guideline is 20 to 70ms. **Late audio is measurably worse than
silence.** Synthesis has no fetch, no decode and no first-play stall, so the
budget is met by construction rather than by hoping the network cooperates.

**Originality.** There is no sample to be recognised. What identity the sound
has comes from interval and envelope choices that are ours.

---

## What SIDEQUEST should sound like

Warm, compact, optimistic, curious, slightly futuristic, youthful, and like a
neighbourhood. A handheld adventure in feel, never in imitation.

**Triangle waves by default.** Rounder than square, and they sit better under
speech and under the midrange honk of a phone speaker. Square is used in two
places only, where something should read as a machine rather than as a place.

**Short.** Almost everything is under 200ms, and a test enforces a 620ms ceiling
on anything that is not ambience. A UI sound that outlasts the gesture that
caused it stops being a response and becomes an announcement.

**Quiet.** No single voice exceeds 0.2 gain before the bus, footsteps are capped
at 0.06, and everything meets a limiter. Cues overlap constantly and the sum has
to stay under the point where a phone speaker crackles.

**Small intervals.** Mostly a fourth or a fifth, occasionally an octave.

**Consistent direction.** Rising for progress, falling for closing, flat for
acknowledgement. Once a player has heard three rising cues on things going
forward, a rising cue means forward.

---

## What it must never sound like

Military. Police procedural. Casino. Gacha. A mobile advertisement. Ominous by
default. And, specifically and bindingly, it must never sound like Pokemon or
any other Nintendo product.

**The test, taken from the brief, is the one that governs:** if a knowledgeable
player could reasonably say "that is basically the Pokemon sound", it is wrong
and it gets rewritten.

Practically, that meant refusing the two things that would most obviously have
produced it:

- **No fanfare.** The wide, leaping, brass-bright ascending flourish is the
  single most recognisable feature of the handheld adventure games this product
  admires. The level-up cue here is four notes, under half a second, and moves
  mostly by step.
- **No transcription.** No cue in `cues.ts` was written by listening to another
  game and approximating it. The melodic content is stepwise motion in A minor
  pentatonic, chosen because five notes with no semitone clashes means any two
  procedurally scheduled lines that land together still sound intentional.

Nothing here reproduces a healing jingle, a level-up melody, an encounter
sting, a battle theme or a menu blip from any existing game.

---

## What the evidence says, and what it does not

The research is in `docs/LIVING_WORLD_RESEARCH.md`. Three findings shape this
document and one of them is a prohibition.

**Sound does not improve learning, and this project does not claim it does.**
No study found in the review shows that sound effects, chimes, stingers or a
music bed improve learning outcomes. The only sound with solid meta-analytic
support is narration that *replaces* on-screen text beside a visual (the
modality principle), and adding audio on top of text somebody is already
reading is a measured null. SIDEQUEST's audio exists for feedback, identity,
atmosphere and responsiveness. It is decoration over a product that must work
in silence.

**Background music has a measured cost under reading.** Vasilev, Kirkby and
Angele's Bayesian meta-analysis of 65 studies puts background sound at
g = -0.21 on reading comprehension and non-lyrical music at g = -0.19. It is
small, and it is a pure cost with nothing measured on the other side. Two rules
follow, and both are implemented:

- **No vocals anywhere, ever.** Lyrical music sits at g = -0.35, statistically
  indistinguishable from intelligible speech. Everything here is instrumental
  because everything here is an oscillator.
- **Music ducks to inaudible whenever a reading surface is open**, not merely
  down. The first version ducked to a third on taste grounds; the evidence
  moved it to six percent.

**Auditory feedback on a small touch target is the one place with a real
positive result.** Brewster (2002) found significantly more codes entered with
sonified buttons on a handheld, reduced workload on four subscales, and users
rating sonified buttons as *less* annoying than silent ones. The mechanism is
that a finger occludes a small control at the moment of contact, so the visual
confirmation is unavailable exactly when it is needed. That is a 390px phone
precisely. It is also the boundary: his desktop study, where visual feedback was
adequate, found no throughput or workload gain at all.

---

## We are not building a vocabulary

Nees and Liebman's meta-analysis of 80 studies and 2,713 participants ranks
earcons, meaning abstract musical motifs, **last** of every alert type on
accuracy, reaction time and subjective ratings. Even Brewster's carefully
psychoacoustically-corrected earcons reached the mid-80s on recognition of one
dimension, and recognition degraded when two were combined.

SIDEQUEST has about thirty cues, which looks like exactly the earcon family that
evidence warns against. The difference is what they are asked to do:

> **No cue in this product carries information. Every one accompanies something
> already visible on screen.**

Nobody is expected to learn that a rising minor third means a thread step. The
XP chip says it, the takeaway says it, the progress line says it. The sound is
acknowledgement, not signal. That is why the whole product is complete with
audio off, and why the settings screen says so out loud.

---

## The three buses

| Bus | Default | What it carries |
| --- | ------- | --------------- |
| SFX | 0.9 | Footsteps, doors, choices, XP, discoveries |
| Music | 0.34 | The district loop and its interior variation |
| Ambience | 0.26 | The bed, and scattered one-shots |

Separately switchable, because they fail differently. A facilitator running a
classroom session needs to kill the music and keep the feedback. The game
accessibility guidelines ask for exactly this separation.

Everything meets a `DynamicsCompressorNode` used as a limiter before the
destination.

---

## Accessibility

**Nothing is ever announced by sound alone.** This is a WCAG requirement and it
is also the reason the product loses nothing when muted.

**Nothing plays without a genuine gesture.** No autoplay, no silent-buffer
unlock trick, no attempt to start on a scroll. The product asks once, plainly,
and takes the answer. WCAG 1.4.2 is not triggered because nothing plays
automatically at all, and a master control exists regardless.

**Nothing plays into a hidden tab.** The context is suspended on
`visibilitychange` and does not auto-resume, because a resume outside a gesture
is what browsers refuse anyway.

**Safe is silent, by an enforced rule rather than by luck.** The audio provider
watches the route and forces silence on `/safe`, publishing the result on the
document element so an e2e test can assert it. Leaving Streets already stops the
music as a side effect of unmounting; emergent properties rot, so it is a rule.

**Sustained, not staccato.** Schlittmeier and colleagues found staccato
instrumental music reduced auditory serial recall where legato did not. The
ambience bed is filtered noise and the music lines are held rather than
percussive.

---

## Ambience

Two layers, which is the standard shape: a continuous quiet bed, and one-shots
scattered irregularly on top.

The bed is low-passed noise, which is what a distant road actually is at this
distance. The one-shots are drawn from a pool of four and fire on a randomised
schedule averaging roughly six seconds, because a fixed interval is heard as a
metronome within about three repetitions.

It sits under the effects. A bed you notice is a bed that is too loud.

---

## Music

One loop for the district and one thinner variation for interiors, in the same
key and at the same tempo so that walking through a door reads as the street
getting quieter rather than as a scene change.

Both are written as note tables in `engine.ts`, scheduled against the Web Audio
clock using the standard lookahead pattern: a timer wakes every 32ms and
schedules anything falling inside the next 120ms. Scheduling from `setTimeout`
alone drifts audibly within a bar on a phone under load.

The Streets loop is deliberately full of rests. A continuous melody is what
makes a short loop wear out, and this one is meant to be inhabited for several
minutes at a time.

**Music is off until asked for and is separately switchable.** Sanders and
Cairns found that a jarring track significantly *lowered* immersion below
silence, and only reversed sign once they pre-tested a better-liked one. Fit is
everything, this loop has not been playtested with real users yet, and that is
recorded as the top risk in the session state.

---

## Provenance

| Asset | Source | Licence |
| ----- | ------ | ------- |
| Every sound effect | Synthesised at runtime from `src/lib/audio/cues.ts` | Original, no file |
| Ambience bed and one-shots | Synthesised at runtime | Original, no file |
| Streets and interior music | Note tables in `src/lib/audio/engine.ts` | Original, no file |

No Nintendo. No Pokemon. No ripped game audio. No fan recreations. No audio
packs. No third-party samples. Nothing downloaded.

Enforced by `tests/unit/integrity.test.ts`, not merely promised.
