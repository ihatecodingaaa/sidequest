# Visual art direction

What SIDEQUEST is allowed to look like, so the whole product looks like one
product rather than a collection of things that arrived separately.

---

## The rule everything else follows

**No visual without a job.**

Valid jobs, and this list is exhaustive:

- establish a setting;
- show the object a decision is about;
- show who is speaking;
- communicate a reaction that the words also state;
- reveal that something changed;
- help recognise an artefact, such as a message or a terminal;
- communicate chapter or progress state.

Not jobs: filling empty space, making a screen look fun, breaking up text,
because a competitor has one.

This is not austerity. It comes from the coherence principle: an image that
carries no information competes for the same limited attention as the text
beside it. A picture that does nothing makes the words next to it harder to
read, which is the opposite of what "add some visuals" is meant to achieve.

---

## Sources

**Everything visual in SIDEQUEST is original, drawn in code.** No stock
photography, no downloaded illustration, no third-party character art, no
AI-generated imagery, no brand logos beyond naming an official service in text.

This is a decision, not a shortage. Original SVG means:

- nothing to license, so `docs/ASSET_LICENSES.md` has no third-party entry;
- nothing to download at a roadshow with bad wifi, and no layout shift;
- one visual vocabulary across the product, because everything is drawn from
  the same geometric rules;
- no risk of the "generic AI hero art" look, which is its own kind of dated.

If a future asset does come from outside, the requirement is: verify the
licence, record the source and the licence in `docs/ASSET_LICENSES.md`, vendor
only what is used. A clean designed placeholder beats attractive filler with an
unclear provenance.

---

## Geometry

Everything derives from the SIDEQUEST mark: a shield with a quest arrow cut out
of it.

- **Corners** are generously rounded. `rounded-2xl` and `rounded-3xl` at
  component scale, `rx="3"` to `rx="5"` at 32 or 48 unit SVG scale.
- **Strokes** are 1.2 to 2.4 units on a 32 or 48 unit viewBox, round-capped and
  round-joined. Never hairlines: they disappear at phone scale.
- **Fills** are flat. No gradients inside an illustration, no shading, no
  drop shadows on artwork. Gradients exist in exactly two places: the brand
  wordmark and a hero colour field.
- **Grids** are 32 or 48 units. Nothing is drawn freehand.

---

## Character style

Deliberately stylised, deliberately not photographic. The build is described
under "Story cast" below; what follows are the rules that constrain it.

**Three prohibitions, and they are not stylistic.**

Realism is banned: a realistic face at 40px is uncanny, and in a crime
prevention product a realistic face invites a reading that appearance predicts
who offends. It does not, and SIDEQUEST will not imply it.

Expression never carries an idea on its own. The dialogue always states the
thing; the face agrees with it. A screen reader gets no expression at all, so
anything only in the face is information some users simply never receive.

No character is drawn as a suspect, a criminal or a victim. They are people in a
situation, which is the entire behavioural argument of the product.

Expression set, closed: `neutral`, `uncertain`, `amused`, `pressured`,
`concerned`, `relieved`.

---

## Mission marks

One abstract diagram per signature mission, showing what the mission *does*
rather than illustrating a scene.

| Mission | Mark |
| ------- | ---- |
| REWIND | Two paths from one point, one turning back |
| Norm Mirror | Two bars at very different heights |
| BREAKSAFE | A grid with one cell changed |
| Crew Shift | Four dots that move |
| Campaign | Four linked nodes, one lit |

Each sits on a quiet accent-tinted field so it reads as a surface rather than an
icon. All are `aria-hidden`: the mission's title is right next to it in text, so
announcing the mark would only repeat it.

---

## Echo, the mascot

Echo used to be a ring with a stroke through it: a logo that talks. It had no
silhouette, so it read as one icon among the others in the set, and nobody
forms an attachment to a logo that talks. It is now a character.

**Construction**, and every part of it is load-bearing:

| Layer | What it is | Why |
| ----- | ---------- | --- |
| Body | The SIDEQUEST shield with its corners eased | The mascot and the logo are visibly the same object, so a character exists without introducing a second visual language |
| Visor | A dark inset panel carrying the face | Stops this becoming a blob with eyes, and gives the expression contrast that survives 28px |
| Eyes | Small, precise, geometric | The entire line between characterful and condescending |
| Crest | A per-variant ornament above the body | Makes the collection structural rather than five colour swaps |

**Six expressions**: neutral, thinking, pleased, concerned, surprised, proud.
Carried by mouth and eye shape together, never by colour, and never alone: the
copy beside Echo always states the thing, because a screen reader gets no
expression at all.

Asymmetry is what separates thinking from concerned. The first version used a
frown for both and they were indistinguishable at any size.

**Hard prohibitions.** No big pleading eyes, no glossy highlights, no blush, no
sparkles, no bounce loop, no limbs. Those are the vocabulary of design that
assumes the viewer needs protecting from complexity, and this product is about
shop theft and money mule recruitment.

**Sizes.** Legible from the same 64 unit drawing at 28px inline in a line of
text and at 120px on a completion screen. Nothing relies on detail that
disappears at the small size.

**Echo never appears on Safe.** Not in any size, not in any state.

### The tonal test

Before adding any charm anywhere, ask:

> If this same screen appeared in a story about something serious happening to a
> friend, would the character still be appropriate?

If not, pull it back. This is the test that keeps cute from becoming childish,
and it is the one worth applying hardest to reward moments.

## Collectible style

Five variants, distinguished by **crest shape first and colour second**, so the
collection reads as five characters rather than one character in five tints.
Each crest also means something:

| Variant | Crest | Earned by |
| ------- | ----- | --------- |
| Core | A single steady arc | Yours from the start |
| Shift | A second arc, offset behind the first | Playing Crew Shift with a crew |
| Signal | A raised antenna with a node | Finishing REWIND |
| Scout | A raised marker, like a flag | Finishing a Field Quest |
| Architect | A squared bracket | Finishing BREAKSAFE |

Displayed as a **grid of tiles**, not a list of rows. Ownership is felt through
display: an enumerated list reads as configuration, a grid at a size where the
characters are visible reads as a collection. Locked tiles keep their full tile,
dim the silhouette, and state their condition, because a slot that is visibly a
slot invites completion in a way a greyed row does not.

The visible label drops the "Echo " prefix, since five tiles starting with the
same word is noise. The accessible name keeps it along with the state.

## Story cast

Built from three separated layers, for the same reason the mascot has a visor:
a flat silhouette in one colour has nothing to separate the face from the head,
so features drown at portrait size.

| Layer | Purpose |
| ----- | ------- |
| Field | A soft tinted disc, so the portrait reads as a person against the card |
| Hair | A real silhouette in the character's colour. The main way you tell them apart at a glance |
| Face | A light plane with dark features, which is where the contrast comes from |

Ken is cropped and squared, Ilyas is longer and swept, Rina is tied back with
volume, You is the simplest shape because it is whoever is holding the phone.

## Editorial motifs

Updates gets artwork about the **object or system a story is about**, never a
scene and never a person's situation. Objects and systems carry information
cheaply; places do not, which is why there is no motif for "a void deck": the
scene label says it in three words and an illustration would take a third of
the screen to say the same thing.

A story with no motif gets no artwork. That is the correct outcome of "no
visual without a job", not a gap to fill later.

---

## Colour

Pillar accents are unchanged: quest violet, pulse cyan, volt green, coral,
gold. What this pass adds is discipline about who may use them.

- One saturated surface per screen, and it is the primary action.
- Campaign node states use colour **and** shape **and** icon **and** a word.
  Colour is never the only carrier of a state.
- Exactly one red element on Safe.
- Character colours come from the character palette and are not pillar accents,
  so a person is never mistaken for a category.

---

## Delight budget

Delight is *load-bearing at a moment*; clutter is *present at rest*. A reward
animation that plays once on unlock is delight; the same animation looping on
the collection screen is clutter. A mascot on a completion screen is a
character; a mascot in the corner of every screen is a watermark.

- At most **one character presence** per screen.
- At most **one hero artwork** per screen.
- **No character at all** on Safe or Settings.
- Artwork concentrates at moments: completion, unlock, chapter start, story
  beats. Steady-state browsing screens stay as clean as the UX pass left them.

## Motion

- One-shot only. A state became another state.
- Entrances 380 to 420ms, transitions 200 to 700ms.
- Nothing is revealed by motion and nothing is hidden without it. The
  reduced-motion render is identical, not merely acceptable.
- Exactly one deliberate loop exists in the product: a 3px drift on the "tap to
  continue" chevron, whose job is to say the scene is waiting for the player. It
  carries no information and the global reduced-motion rule stops it dead.

Banned: looping glows, permanent bounce, particles, animated backgrounds,
constant mascot motion, splash sequences, confetti after a harmful fictional
outcome.

---

## Typography

Unchanged from the previous passes and restated because it is part of the
system: display face for headings and numbers, body face for prose, hierarchy
from size and weight rather than from boxes and chips. Story lines render at
`1.05rem` with relaxed leading, which is slightly larger than UI body text
because a story is read rather than scanned.

---

## Prohibited aesthetics

- Stock photography of teenagers looking concerned.
- Generic corporate flat illustration.
- Anime or manga pastiche.
- AI-generated hero images.
- Mixed icon sets. Lucide is the only icon library, and product artwork is
  hand-drawn SVG rather than icons pressed into service as illustration.
- Anything that makes the product look childish. The audience is 13 to 25 and
  the subject is real offences.
