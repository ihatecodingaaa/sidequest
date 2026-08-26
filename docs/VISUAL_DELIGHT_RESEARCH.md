# Visual delight research

Why SIDEQUEST still reads as a polished civic app rather than something a
sixteen year old wants to open, and what to do about it without making it
childish.

Conducted 26 August 2026 against the build at commit `df5bfd0`.

The previous three passes made the product **usable**: clear navigation, low
cognitive load, good hierarchy, player-paced stories, a Campaign that says where
you are. None of that is in question here and none of it should be undone. The
gap this pass addresses is different, and the reviewer named it precisely:

> The collectible / avatar layer is technically present but not emotionally or
> visually obvious.

That sentence is the whole brief. The last pass shipped an Echo collection with
five deterministic unlocks, a selection that persists, and tests proving all of
it works. A user looking at the app for two seconds could not tell any of it
existed. **Shipping a feature and making a feature perceptible are different
jobs, and only the first one was done.**

Confidence is one of **High** (clear principle, directly applicable), **Medium**
(good reasoning, transferred across a gap), **Low** (judgement call, argue with
it).

---

## 1. Why the current visual layer still feels restrained

**Question.** The app is clean, accessible and well organised. Why does it read
as a productivity tool?

**Observed problem.** Look at any screen and count what is doing the visual
work: a heading, body text, a rounded card, a small accent-coloured icon, a
green button. That vocabulary is complete and consistent, which is why the
product looks *professional*. It is also exactly the vocabulary of a banking
app, a government portal and a project tracker. **Nothing on screen is a
character, a place, an object, or a thing that happened.** Everything is a
container for text.

The previous pass added abstract mission marks and 40px portraits and reported
them honestly as "small and subtle" and "functional, not beautiful". That was
the right diagnosis and an insufficient response.

**Principle.** Visual restraint is a virtue when the alternative is noise, but
restraint is not the same as absence. The previous passes were correcting
over-decoration (card soup, chip spam, pulsing badges) and correctly cut it. The
error was treating the resulting emptiness as the finished state rather than as
cleared ground.

**SIDEQUEST implication.** There is now room for artwork that carries meaning,
and the discipline to stop it becoming clutter. The rule from the last pass, **no
visual without a job**, is retained in full. What changes is that "be the
character the player is talking to" and "be the thing you unlocked" are
recognised as real jobs, where before only informational jobs counted.

**Decision.** Keep the rule, widen the list of valid jobs to include
*identity*, *ownership* and *occasion*. Every visual added in this pass names
its job in a code comment.

**Confidence.** High.

---

## 2. Mascots and emotional attachment

**Question.** Does a mascot do anything, or is it decoration with a face?

**Observed problem.** Echo exists, has four moods, and appears as a 36px ring
with a line through it. It is a logo that talks. Nobody forms an attachment to a
logo that talks.

**Principle.** Two things are actually established and worth separating from
mascot folklore.

The first is *parasocial* rather than aesthetic: a consistent character that
reacts to what you did is read as an agent with a point of view, and people
attribute intent and continuity to it. That attribution is what makes a
companion feel like a companion rather than a status indicator. Schroeder,
Adesope and Gilbert's meta-analysis (cited in `docs/GAME_FEEL_RESEARCH.md`)
found agents help most when they *signal* and least when they narrate what is
already on screen, which constrains what Echo should say but not whether Echo
should be a character.

The second is recognition: a silhouette that can be identified at a glance
becomes a shorthand for the product. A ring with a stroke through it has no
silhouette. It reads as an icon in a set, because that is what it is.

**SIDEQUEST implication.** Echo needs a body, a face and a stable silhouette. It
does not need limbs, a backstory, or more to say.

**Decision.** Redesign Echo as a rounded shield-derived character with a visor
face: two eyes and a mouth that change with expression, a fixed silhouette, and
per-variant structural ornaments. Built to read at 28px in a line of text and at
120px on a completion screen. Echo's *voice* is unchanged: short, reactive,
never congratulatory about learning.

**Confidence.** Medium-high. The recognition argument is solid. The attachment
argument is reasoned rather than measured, and it is the sort of thing this
project cannot test before the deadline.

---

## 3. Visible collectibles and ownership

**Question.** The collection works. Why does it not feel like one?

**Observed problem.** The Echo collection is a vertical list of five rows, below
the Safety Passport, on a screen that already scrolls a long way. Each row is a
40px mark, a name, and a line of text. It is a settings list with a lock icon.

**Principle.** Ownership is felt through *display*, not through possession.
A collection that is enumerated reads as configuration; a collection that is
laid out, sized, and shows its gaps reads as a collection. The gaps matter as
much as the items: a locked slot that is visibly a slot invites completion in a
way that a greyed row does not.

Birk, Atkins, Bowey and Mandryk (CHI 2016) tie the motivational effect to
*identification*, not to menu size, which is why this stays at five variants. But
identification needs the thing to be seen at a size where it can be identified.

**SIDEQUEST implication.** Same five variants, same deterministic unlocks, same
refusal to add randomness or currency. What changes is presentation: a grid of
real tiles at a size where the differences are visible, the active one clearly
worn, the locked ones clearly slots rather than rows.

**Decision.** A grid, tiles roughly 96px, the equipped variant marked, locked
tiles showing the silhouette dimmed with their unlock condition in text. Moved
above the Safety Passport's untouched-skills list, because a collection is a
more interesting answer to "what have I done" than an inventory of things you
have not.

**Confidence.** High for the direction. Medium for the specific layout.

---

## 4. Reward order on completion screens

**Question.** Why does finishing a mission feel like receiving a report?

**Observed problem.** The current order is: tick, title, XP, level, **"Added to
your Safety Passport" with per-skill point deltas**, outbound links, buttons.
Four of the first five things are numbers about the player.

**Principle.** Reward sequencing is about answering the player's questions in
the order they are actually asked. After a story, those are: *what just
happened*, then *what did I get*, then *what now*. "You gained 22 points in Peer
Intervention" answers none of them, and it answers a fourth question that only a
teacher is asking.

There is also a specific failure mode here worth naming: an unlock that is
merely *recorded* is not an unlock. If a player finishes BREAKSAFE and Echo
Architect silently becomes available on a different screen, the unlock has
happened in the database and not in the experience.

**SIDEQUEST implication.** Reorder rather than remove. The passport data is
genuinely useful to a school or partner and is one of the honest things about
this product. It just does not go second.

**Decision.** New order: what happened, **any new Echo unlocked, shown large and
equippable on the spot**, XP, then next step, then the passport detail demoted
to a collapsed disclosure. Nothing is deleted.

**Confidence.** High.

---

## 5. Cute without childish

**Question.** The brief asks for cute and forbids childish. Where is the line?

**Observed problem.** The obvious ways to add charm are the ways that would
wreck this product: pastel rounding everywhere, emoji, exclamation marks,
confetti, a mascot with big pleading eyes. SIDEQUEST is about shop theft, money
mule recruitment and account misuse. A cartoon apologising for a crime is worse
than a plain interface.

**Principle.** The distinction is not softness, it is **condescension**. Childish
design assumes the viewer needs protecting from complexity: it simplifies the
content, inflates the feedback, and celebrates trivial actions. Characterful
design leaves the content exactly as serious as it is and gives it a face,
timing and a point of view.

Practically, the line falls on four things:

| Childish | Characterful |
| -------- | ------------ |
| Big round pleading eyes, blush marks | Small precise eyes, restrained expression |
| Celebrates everything | Celebrates the specific thing, once |
| Exclamation marks, emoji, slang | Plain sentences with timing |
| Cartoon reacts *for* you | Character reacts *to* you |

**SIDEQUEST implication.** Echo gets a face, but a geometric one on a
shield-derived body: soft silhouette, hard construction. No blush, no sparkle
eyes, no bounce loop. Reward moments are emphatic once and then still.

**Decision.** The tonal test written into the art direction: **if the same
screen appeared in a story about something serious happening to a friend, would
the character still be appropriate?** If not, pull it back.

**Confidence.** Medium. This is the judgement most likely to divide reviewers,
and the one most worth putting in front of actual teenagers.

---

## 6. Visual storytelling and reading burden

**Question.** Can artwork reduce reading rather than add to it?

**Observed problem.** The story now paces well but every beat is still text.
Knowing who is speaking, what they feel and where the scene is happening all
arrive as words.

**Principle.** This is the multimedia principle applied honestly. An image helps
when it carries information the text would otherwise have to spend words on. A
portrait that establishes the speaker saves "Ken said"; an expression that shows
pressure saves a clause. An illustration of a void deck saves nothing, because
the scene label already said "void deck" in three words and the illustration
takes a third of the screen.

**SIDEQUEST implication.** Invest in **characters and objects**, not in
environments. Faces and things carry information cheaply; places do not.

**Decision.** Portraits get significantly better and larger. Scene backdrops are
not added. Mission cards get an object or vignette that says what kind of
experience it is. Updates gets illustration only where a story is *about* an
object or system that can be drawn.

**Confidence.** High.

---

## 7. Delight without clutter

**Question.** Every previous pass removed decoration. How does this one add
without regressing?

**Principle.** The difference between delight and clutter is whether the element
is *load-bearing at a moment* or *present at rest*. A reward animation that
plays once when you unlock something is delight. The same animation looping on
the collection screen is clutter. A mascot on a completion screen is a
character; a mascot in the corner of every screen is a watermark.

**SIDEQUEST implication.** Artwork concentrates at moments: completion, unlock,
chapter start, story beats. Steady-state browsing screens (Missions list, Safe,
Settings) stay as clean as the last pass left them.

**Decision.** A per-screen budget written into the art direction: **at most one
character presence per screen, at most one hero artwork per screen, no
character on Safe or Settings at all.**

**Confidence.** High.

---

## 8. Campaign as a journey rather than a list

**Question.** The Campaign map is clear now. Why does it still read as a task
list?

**Observed problem.** It is a vertical list of equal-width cards with a hairline
running behind the status dots. Structurally it is a checklist with a decorative
spine. The information is right and the metaphor is administrative.

**Principle.** A journey reads as a journey when position along it is
*spatial*, not just *ordinal*. A list says "item 2 of 4". A path says "you are
here, that is behind you, that is ahead". The difference is whether completed
and future states occupy visibly different territory.

**SIDEQUEST implication.** The spine should carry state rather than sit behind
it: filled where you have been, dimmed where you have not. Chapters should
differ in weight by state rather than only in tint. The finale should look like
an end, not like a fifth row.

**Decision.** Keep the vertical structure, which is correct for a phone and for
screen readers. Change what it is made of: a segmented progress spine that fills
as you go, a dominant current chapter, compact completed chapters, and a finale
that is visually a destination. No horizontal scrolling map: it would break
reading order and add a gesture for no gain.

**Confidence.** Medium-high.

---

## What this research argued against

| Idea | Why |
| ---- | --- |
| Big-eyed kawaii mascot | Condescension, and wrong against the subject matter. Section 5. |
| Mascot on every screen | Becomes a watermark, stops being a character. Section 7. |
| Scene backdrop illustrations | Places cost a lot of screen and save no words. Section 6. |
| Horizontal swipe campaign map | Breaks reading order, adds a gesture, gains nothing on a phone. Section 8. |
| More Echo variants | Identification is the mechanism, not menu size. Section 3. |
| Removing the Safety Passport from completion | It is useful and honest. It just does not go second. Section 4. |
| Confetti or fanfare after a bad outcome | Celebrating a harmful fictional result. Section 5. |
| Any Echo presence on Safe | Non-negotiable, and unchanged from previous passes. |
