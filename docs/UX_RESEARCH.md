# SIDEQUEST UX research

Research conducted before the consumer UX pass of 26 August 2026.

Every principle below exists because it changed a decision. Where a figure is
quoted, the source is named. Where something is convention rather than
evidence, it says so, because dressing convention up as research is how design
documents become theatre.

Two things in this document are corrections to reasoning I started the pass
with. They are marked. Research that only ever confirms you is not research.

Confidence key: **High** = primary source with quoted figures. **Medium** =
reputable secondary source, or well established convention. **Low** = inference.

> **Later work.** The signature experience pass extends this research rather
> than replacing it: comparison and reveal design, peer influence
> visualisation, motivation, provenance labelling, and PWA install behaviour
> are in `docs/SIGNATURE_EXPERIENCE_RESEARCH.md`. One finding there revises a
> decision recorded here: the anti-fatigue rule allowing a screen-level
> provenance declaration is only safe when that declaration is exhaustive for
> the screen, because labelling a subset raises the perceived accuracy of
> whatever is left unlabelled.

---

## 1. Target size

**Source (verified):** W3C, Understanding SC 2.5.8 Target Size (Minimum).
https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html

WCAG 2.2 AA requires pointer targets of at least **24 by 24 CSS pixels**, with
five exceptions: spacing (a 24px circle centred on the target must not
intersect another target or its circle), equivalent, inline, user agent
control, and essential. Level AAA (2.5.5) asks for **44 by 44**.

**Bottom-of-screen targets need to be the largest on the screen.** Steven
Hoober's touch data gives roughly 11mm at the top of the screen, **12mm at the
bottom**, and as little as 7mm in the centre, because the bottom edge is where
taps are least accurate.
https://www.smashingmagazine.com/2023/04/accessible-tap-target-sizes-rage-taps-clicks/

**Decision.** The centre Safe control is a 56px mark inside a full-height
column of roughly 78 by 64 CSS pixels at 390px width. That clears AA by a wide
margin, clears AAA, and clears Hoober's 12mm bottom-edge figure. The label is
part of the target, not a caption beside it. An automated test pins the
geometry.

**Confidence:** High for WCAG. Medium-High for Hoober, whose book is the
primary source.

---

## 2. Fitts's Law, applied properly

Movement time is a function of **both** distance and target size, roughly
`MT = a + b log2(2D/W)`. The slogan "make it bigger" ignores half the model.

**SIDEQUEST implication.** The naive reading is wrong twice. The bottom bar was
already the closest region to the thumb, so Safe's problem was never distance.
And the centre of a five-item bar is the *hardest* spot to reach one-handed on
a large phone, because the thumb arcs from a bottom corner. Hoober's
observational study (1,333 observations; **49% one-handed, 36% cradled, 15%
two-handed**) also documents that a tapping thumb **occludes the label it is
hitting**.
https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php

**Decision.** Move Safe to centre for **recognition and muscle memory, not
speed**, and offset the worse thumb geometry by making the target taller than
its neighbours. The documentation does not claim centre placement makes Safe
faster to reach, because for a right-handed user on a 430px phone it probably
does not.

**Confidence:** High for the law. Medium for the thumb-arc application; Hoober
himself has asked designers to stop treating his reach diagrams as law.

---

## 3. Hick-Hyman, and a correction

**Correction.** I began this pass intending to justify the Safe redesign with
Hick's Law. That justification is weaker than it looks and I have removed it.
Hick (1952) and Hyman (1953) used **simple, equiprobable, pre-learned
stimulus-response choices**. Applying the law to labelled interface options
that a person must read and comprehend is common in design writing and has no
direct empirical support. It is folklore.

**What actually justifies the Safe redesign** is less tidy and better
evidenced: reading load, categorisation, and stress (section 4). Eight flat
cards with roughly ninety words of body copy is a reading task. Four
categorised paths with a fragment each is a glance. Categorising also converts
one wide decision into two narrow ones, which is a real structural gain
independent of any timing law.

**Decision.** Safe reduced to four categorised paths. The mission catalogue was
**not** reduced, because browsing a catalogue is not the same act as choosing
under pressure, and its problem was indistinguishable items rather than count.

**Confidence:** High that the folklore version should not be cited.

---

## 4. Acute stress and interface design

Under acute stress attention narrows, working memory degrades, and people
fixate on the first plausible option rather than comparing alternatives.
Reading comprehension drops.

**Decision.** Four paths ordered by urgency rather than by expected frequency.
One fragment per path. The most urgent path first and visually distinct. No
decorative content above the paths. No profile, campaign, XP or network
dependency anywhere on the screen, so it renders instantly and cannot be broken
by anything happening elsewhere.

**Confidence:** Medium. The underlying psychology is well established; this
specific arrangement is design judgement.

---

## 5. Alarm fatigue, applied twice

Salience is finite. When a signal fires constantly or marks non-urgent things,
people stop responding to it.

**Applied to Safe.** Making every card red would destroy the hierarchy the
screen needs. Red now appears on exactly one path, the one that means someone
is in danger right now.

**Applied to honesty labelling, which is the less obvious case.** The
"PROTOTYPE CONTENT" chip appeared six times in one viewport on Home and on all
eight Pulse cards. At that density it had stopped being information and become
texture, which weakens it exactly where it matters most: on a Norm Mirror
percentage, or a reward naming a potential partner.

**Decision.** Provenance is preserved wherever a claim is made (every detail
view, every mission, every reward, every Norm Mirror reveal, the impact page)
and is declared **once per screen** rather than once per card in dense feeds.
The obligation is that nothing seeded is passed off as real; a prominent
per-screen declaration plus per-claim labelling satisfies that better than a
chip that has become wallpaper. This is now written into `CLAUDE.md` so it
cannot be quietly eroded into "we removed the labels".

**Confidence:** High for the principle, Medium for the labelling application,
which is a judgement about where the honesty obligation actually bites.

---

## 6. The elevated centre item: what the evidence actually says

This is the most contested decision in the pass, and the evidence is mixed.
Setting it out honestly.

**Apple is explicit, and it is the strongest statement against the pattern:**

> "Use a tab bar only to enable navigation, not to help people perform actions."

The archived HIG is blunter: *"Use a tab bar strictly for navigation. Tab bar
buttons should not be used to perform actions."*
https://codershigh.github.io/guidelines/ios/human-interface-guidelines/ui-bars/tab-bars/index.html

**Material calls them destinations**, specifies three to five, and places the
FAB *above* the navigation bar rather than inside it.
https://raw.githubusercontent.com/material-components/material-components-android/master/docs/components/BottomNavigation.md

**NN/g warns against mixing kinds within one tab control:** *"Mixing in-page
and navigation tabs within one tab control will disorient users"*, and tabs
*"should use the same unselected and selected styling"*.
https://www.nngroup.com/articles/tabs-used-right/

**Instagram ran the experiment at billion-user scale.** The centre slot has
churned repeatedly: Create, then Reels (Nov 2020), then Create again (Feb
2023), then DMs (2025). Adam Mosseri on the last move: *"Messaging is used a
lot more than the create button, so we're testing putting DMs in both in the
middle position."*
https://www.socialmediatoday.com/news/instagram-tests-placement-dm-button-in-the-main-ui/733842/

**The only direct study of a distinctive centre element is thin but its shape
matters.** Jones (UMass honours thesis, 2016, n=40): first use **2.63s control
vs 3.03s FAB** (slower), second use **1.805s vs 1.48s** (faster). A distinctive
centre element **costs you on first encounter and repays on repeat use.**
https://stevejones.io/img/projects/honors-thesis/User-Experience-of-the-Floating-Action-Button.pdf

**There is no study** of users being confused by a centre item that behaves
unlike its neighbours. The nearest real evidence is Swearngin and Li (CHI
2019, 20,174 elements): agreement on what is even tappable was only Fleiss'
κ = 0.520, and *"unconventional styles may make an element more prone to
ambiguity in tappability."*
https://arxiv.org/abs/1902.11247

**Decision, and how each concern is answered.** Safe becomes the elevated
centre item, but every tab affordance is preserved so it does not become the
mixed metaphor NN/g warns about:

- It **navigates**. Apple's rule is satisfied literally: Safe is a destination,
  never an action. Tapping it opens a screen and does nothing else. No dial, no
  report, no location, no notification. An e2e test asserts this.
- It **keeps a text label**, like its neighbours.
- It takes **`aria-current="page"`**, like its neighbours.
- It sits **in the tab row**, not floating above as a FAB.
- It gets **brand colour, not alarm colour**, and it does not pulse.
- The first-use cost from the Jones finding is mitigated by the label, which is
  the thing that carries meaning (section 7).

**Confidence:** Medium. This is a reasoned position against genuinely mixed
guidance, not a finding. The strongest support is Instagram's revealed
preference for a destination in that slot; the strongest caution is NN/g's
styling consistency rule, which this design knowingly bends.

---

## 7. Icons, labels, and which one is doing the work

**Wiedenbeck (1999), Behaviour & Information Technology 18(2):68-82** compared
label-only, icon-only, and icon-plus-label interfaces: *"In the first session
performance was best on the label-only and icon-label interfaces."*
https://www.tandfonline.com/doi/abs/10.1080/014492999119129

Read carefully, that is icon+label ≈ label-only, and both beat icon-only.
**The label carries the meaning; the icon does not rescue an unclear one.**

NN/g concurs: *"A text label must be present alongside an icon to clarify its
meaning"*, and only *home, print, and the magnifying glass* are near-universal.
https://www.nngroup.com/articles/icon-usability/

**Decision.** Every tab keeps a label, including the elevated one. No icon-only
primary navigation anywhere.

**A second, cheap decision came out of this.** YouTube renamed its Library tab
to "You" in 2023, and the thing that makes it work is that **the icon is the
user's own avatar** rather than a generic person outline. A personal mark is
one of the few genuinely conventional signifiers in mobile UI. SIDEQUEST's You
tab now shows the user's initial when they have given a name, falling back to
the person icon when they have not.
https://9to5google.com/2023/09/30/youtube-library-you-tab/

**Confidence:** High for Wiedenbeck. Medium for the avatar inference, which is
reasoning from a verified example rather than a sourced finding.

---

## 8. Navigation labels, and the finding I did not act on

**NN/g Menu-Design Checklist, guideline 7, verbatim:**

> "Menus are not the place to get cute with made-up words, internal jargon, or
> abstract high-level categorization. Stick to terminology that clearly
> describes your content, features, or resources."

https://www.nngroup.com/articles/menu-design/ and
https://www.nngroup.com/articles/category-names-suck/

And the test: *"users won't click on a category unless it's clear where they
will go, before they click."*
https://www.nngroup.com/articles/3-ia-mistakes/

**This indicts "Pulse".** It is an invented word with no conventional icon and
no information scent. Two mitigations people reach for do not hold up:

- **Pairing an icon does not rescue it.** Per Wiedenbeck and NN/g, text
  disambiguates icons, not the other way round. "Pulse" has no conventional
  icon, so pairing it with one is pairing two ambiguous signifiers.
- **Onboarding does not rescue it.** NN/g's own study found tutorial readers
  performed no better than skippers (91% vs 94%, p=0.443) and rated the tasks
  as **harder** (4.92 vs 5.49 on 7, p=0.047).
  https://www.nngroup.com/articles/mobile-tutorials/

**And the audience makes it worse, not better.** NN/g's teen research (100
teens aged 13-17, three rounds) found teens *"perform worse than adults"* on
insufficient reading skills, weaker research strategies, and *"dramatically
lower levels of patience."*
https://www.nngroup.com/articles/usability-of-websites-for-teenagers/

**Decision: not changed in this pass, and flagged instead.** "Pulse" is an
established product pillar that runs through the route, the documentation and
the pitch. Renaming it is a brand decision with reach well beyond a UX pass,
and it is the user's call rather than mine. It is recorded as the single
highest-confidence unaddressed finding in `docs/UX_AUDIT.md` (H8) with a
recommended replacement, and if any user testing happens it should be the first
thing tested. **Safe** and **Missions** are milder cases of the same issue and
are kept.

**Confidence:** Medium-High that the finding is real. NN/g states it
repeatedly, though without a quantified study.

---

## 9. Cards, and honest limits

**NN/g:** *"Card layouts are less scannable than lists"*; *"Cards take more
space"*; *"a poor choice when users need to compare between multiple options"*;
*"Card layouts typically deemphasize the ranking of content."* They help for
*"collections of heterogenous items."*
https://www.nngroup.com/articles/cards-component/

**Material's own card spec names the anti-pattern:** *"A quickly scannable
list, instead of cards, is an appropriate way to represent homogeneous content
that doesn't have many actions."*
https://m1.material.io/components/cards.html

**On borders, NN/g is direct:** *"When possible, using whitespace alone to
create clear groupings reduces the visual complexity of a design"*, and borders
are *"often added in an abundance of caution."*
https://www.nngroup.com/articles/common-region/

**Honest limit, and it matters.** There is **no controlled experiment anywhere
comparing card layouts to list layouts.** "Card soup" is coined terminology,
not a measured construct. The claim that cards increase cognitive load has no
study behind it. Everything above is expert guidance and craft convention.

**Counter-evidence, stated rather than buried.** Baymard's dashboard research
recommends **uniform** card styling, because inconsistent styling made users
scroll past features that were visibly on screen.
https://baymard.com/blog/cards-dashboard-layout

**Decision.** Differentiate by **structure**, not by decorating individual
cards differently. Homogeneous scannable content (the Pulse list, quick
missions, Safe's reading links, Home's crew and radio rows) becomes lists with
dividers. Genuinely heterogeneous, self-contained items keep cards. Exactly one
element per screen gets a deliberately different hero treatment. That respects
Baymard's warning, since within any one group the styling stays uniform.

**Confidence:** Medium. The direction has agreement from NN/g and Material; the
underlying evidence base is thinner than design writing usually admits.

---

## 10. Motion

Motion is useful when it communicates causality or state change. Continuous
ambient motion in peripheral vision competes for attention indefinitely and
cannot be ignored.

**Decision.** Safe gets press feedback and an active state, never an idle
animation, and an automated test asserts that nothing in the bar animates at
rest. The Home radio card's permanent pulse ring was removed, since it signalled
nothing. The BREAKSAFE hotspot pulse is kept, because it marks interactive
targets in a task that is explicitly about finding them. All of it continues to
respect `prefers-reduced-motion`.

**Confidence:** High.

---

## 11. Framing and institutional language

**Decision.** Removed "Pillar one/two/three" eyebrows, the "3 of 11 completed"
denominator on the browse screen (a denominator implies a syllabus), the
mission-type glossary footer, and the product-thesis card on Home. Source
attribution is kept, because it is an honesty requirement, but it is no longer
the first body text a user reads.

**Confidence:** Medium-High. Direction well supported by plain language
guidance; specific wording is editorial.

---

## 12. Finite content and "Drops": declined, with reasons

The brief asked whether SIDEQUEST should adopt a "Drop" concept for novelty,
anticipation and scarcity. **Rejected**, on three grounds.

**It would be a fabrication.** SIDEQUEST has a fixed catalogue and no content
pipeline. Nothing actually drops. A countdown to nothing is fake urgency, which
Brignull's taxonomy classifies as a deceptive pattern, and which DSA Article 25
addresses directly.
https://www.deceptive.design/types

**The regulatory direction is explicit about this mechanic and this audience.**
European Commission guidelines under DSA Article 28(1), 14 July 2025, recommend
*"disabling by default features that contribute to excessive use, like
communication 'streaks,' ephemeral content, 'read receipts,' autoplay"* for
minors.
https://digital-strategy.ec.europa.eu/en/library/commission-publishes-guidelines-protection-minors

**The best available teen evidence shows the same feature cutting both ways.**
Kim et al. (ACM CSCW), 29 teens aged 13-18 on BeReal, found the finite framing
genuinely lowered pressure (*"it'll just be away in 24 hours"*) **and**
manufactured obligation (*"you feel the need to do it, you feel like you have
to do it"*) from the same mechanic. Their recommendation: **scaffold, do not
enforce.**
https://dl.acm.org/doi/10.1145/3686909

**A note on the pop-neuroscience**, since it usually appears in decks like
this: "a daily drop gives users a dopamine hit" is wrong twice. Dopamine
mediates wanting rather than liking (Berridge), and a *predictable* daily
reward is precisely the zero prediction-error case. If this claim appears in
the pitch, it should be cut.
https://pmc.ncbi.nlm.nih.gov/articles/PMC2756052/

**Decision.** Adopt only the honest part: **one clearly primary thing on Home**,
chosen from real state (continue your campaign, or start it). No countdowns, no
artificial expiry, no streak penalty, nothing a user is punished for missing.
Recorded in the audit under future opportunities, where a real content schedule
would make a drop legitimate.

**Confidence:** High on the reasoning. This is the one requested feature I
declined, and the reason is that implementing it honestly is impossible without
a pipeline that does not exist.

---

## 13. Dark mode

Assessed and kept. Surfaces are genuinely layered (`ink-900` page, `ink-850`,
`ink-800` card, `ink-700` raised), the token contrast failure found earlier in
the project was fixed and is enforced by an axe suite across every route, and
violet is one of five accents rather than a background wash. Light mode is
feature scope and is deferred, not forgotten.

**Confidence:** High that it passes AA, since it is machine checked. Medium
that it feels premium, which is a judgement.

---

## 14. What could not be verified

- **Apple's HIG page is client-rendered** and returned only its title on direct
  fetch. The tab bar quotations above come from Apple's archived HIG mirror,
  which matches the current guidance in substance. Apple's 44pt convention is
  treated as Medium-confidence convention, and nothing here depends on it since
  WCAG's 44px AAA figure was verified independently.
- **Material Design 3** navigation dimensions were not verified from the
  primary source; the M3 site is a JS application. The quoted card guidance is
  from the **superseded v1 spec**, and is labelled as such.
- The widely repeated **Spotify "9% more clicks"** figure has no named source or
  methodology and is not relied on here.
- **"First click predicts success, 87% vs 46%"** has no published methodology
  and is not relied on here.

---

## 15. Post-implementation validation

Re-checked after the pass, because research that is written and then ignored is
worse than no research.

| Principle | Decision | Followed |
| --------- | -------- | -------- |
| Target size (1) | 78x64 column, 56px mark, label included | Yes, pinned by test |
| Fitts (2) | Centre for recognition, taller to offset thumb arc | Yes, and not overclaimed |
| Hick (3) | Removed as a justification; kept the real reasons | Yes, corrected |
| Stress (4) | Four paths, fragments, urgency order, zero dependencies | Yes |
| Alarm fatigue (5) | One red path; provenance per screen plus per claim | Yes, written into CLAUDE.md |
| Centre item (6) | Elevated destination, every tab affordance kept | Yes, asserted by test |
| Labels (7) | Label on every tab; avatar initial on You | Yes |
| Made-up words (8) | "Pulse" flagged, not changed | **No, deliberately deferred to the user** |
| Cards (9) | Structural differentiation, uniform within groups | Yes |
| Motion (10) | No idle animation in the bar | Yes, asserted by test |
| Language (11) | Pillars, denominators and glossary removed | Yes |
| Drops (12) | Declined | Yes, deliberately |
| Dark mode (13) | Kept | Yes |
