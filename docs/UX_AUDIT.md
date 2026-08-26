# SIDEQUEST UX audit

Conducted 26 August 2026, against the build at commit `bdd8a1f`.

Method: the whole product rendered at 390, 430, 768 and 1440 CSS pixels and
inspected as screenshots, not read as source. Automated checks for horizontal
overflow and for content occluded by the fixed bottom navigation found nothing,
which is the point: **the build has no layout defects and still does not feel
like a consumer product.** That is the problem this audit is about.

Principle references point at `docs/UX_RESEARCH.md`.

---

## The one-sentence verdict

SIDEQUEST currently presents like a well-built **catalogue of its own
features**, narrated in the language of its own internal architecture, with
every element wrapped in an identical card. Nothing is broken. Almost nothing
is prioritised.

## Tests applied

**Five-second test.** On Home, after five seconds, the obvious next action is
unclear. There are six competing "go elsewhere" links and eleven cards of
near-identical weight. A user cannot tell what SIDEQUEST wants them to do.

**Squint test.** Blur the text on Home and you see eleven rounded rectangles of
the same radius, border, padding and internal structure. Hierarchy is carried
almost entirely by text, which is exactly the failure mode this test detects.

**Distance test.** The first thing that commands attention on Home is the XP
chip, then the level card. Neither is something to do.

**Emergency test.** Safe presents eight flat cards with paragraph-length body
copy. Under stress, a user must read roughly 90 words to choose a path.

**Teenager test.** Failed, and it is not close. "PILLAR TWO", "PILLAR THREE",
"3 of 11 completed", "Based on Singapore Police Force advisories" as the first
body text on Home, and a mission-statement card at the bottom of the home
screen. This reads as institutional.

---

## Critical

### C1. Safe is a flat list of eight choices, read under stress

**Screen:** `/safe`
**Observation:** Two urgent cards, then six "Official services" cards in a flat
list with no grouping. Each carries a title, a two-line description, and a
third line of handoff explanation. Roughly 90 words before a decision.
**Why it matters:** This is the one screen whose users are, by definition, not
calm. Attentional narrowing under stress reduces the number of options a person
can meaningfully evaluate, and reading comprehension degrades. A flat six-item
list forces linear reading at exactly the wrong moment.
**Principle:** Attentional narrowing under acute stress, reading load, and
categorisation. Note that Hick's Law is *not* cited here even though it is the
obvious reach: its original experiments used equiprobable, pre-learned
stimulus-response choices, not labelled options a person must read. See
`docs/UX_RESEARCH.md` section 3.
**Recommended change:** Reduce to four categorised pathways answering one
question, "what do you need help with". Emergency, Scam help, Report something,
Police services. Everything else moves to a secondary group or off the screen.
Cut body copy to one short line per path.
**Implemented:** Yes

### C2. Safe is not where muscle memory expects it, and is not distinct

**Screen:** bottom navigation, all routes
**Observation:** Safe is the fourth of five equally weighted tabs. It is
visually identical to Home, Pulse, Missions and You apart from icon and colour.
**Why it matters:** The stated long-term product goal is that a user always
knows where Safe is. A tab in fourth position, styled identically to its
neighbours, has no acquisition advantage and no recognisability advantage.
**Principle:** Fitts's Law (both size and position matter), recognition over
recall, muscle memory and positional consistency.
**Recommended change:** Move Safe to the centre of a five-item bar and give it
an elevated, branded treatment. Keep it a destination, not an action. Do not
make it red or make it pulse.
**Implemented:** Yes

### C3. Home is a feature catalogue with no primary action

**Screen:** `/`
**Observation:** Eleven cards across nine sections, six "see all" style links,
and no single dominant element. Level card, Pulse hero, three signature
missions, campaign, quick quest, field quest, crew, radio, reward, thesis.
**Why it matters:** A home screen that presents everything equally teaches the
user that nothing in particular matters. Information scent is diluted across
six exits.
**Principle:** Visual hierarchy, information scent, choice overload, serial
position (the middle of a long list is the least recalled region).
**Recommended change:** One hero with real weight, then a small number of
clearly subordinate items. Collapse the rest behind the tabs that already exist.
**Implemented:** Yes

### C4. Safe was unreachable on a device that had never opened SIDEQUEST

**Screen:** `/safe`
**Observation:** Found by writing the new Safe tests rather than by looking at
screenshots. Safe sat inside the `(app)` route group, behind the onboarding
gate. A first-time visitor, including one who had just been handed a phone or
who had cleared site data, was made to answer four onboarding questions before
they could reach an emergency number.
**Why it matters:** This is the exact scenario the product claims to serve:
somebody who needs help, now, possibly under stress, possibly on a phone that
is not theirs. A safety hub that a setup flow can block is not a safety hub.
Nothing on Safe needs a profile.
**Principle:** Progressive disclosure has a floor. Also the general rule that a
safety affordance must not depend on unrelated application state.
**Recommended change:** Exempt Safe from the onboarding gate, the same way
Campaign QR routes already are.
**Implemented:** Yes, with a regression test that loads `/safe` with no
profile at all.

---

## High

### H1. Card soup across every primary screen

**Screen:** `/`, `/missions`, `/safe`, `/you`, `/pulse`
**Observation:** Virtually every element is a rounded rectangle with the same
radius, the same one-pixel border, the same padding and the same internal
layout of chip, title, body, metadata row.
**Why it matters:** Cards work when items are discrete, comparable and
self-contained. Used for everything, they flatten hierarchy: common region
groups things that are not actually alike, and similarity implies equivalence
that does not exist.
**Principle:** Gestalt common region and similarity, visual hierarchy.
**Recommended change:** Reserve the card for genuinely card-like content. Use
lists, dividers, full-bleed surfaces and whitespace for the rest. Introduce a
deliberately different hero treatment so one thing can outrank the others.
**Implemented:** Yes

### H2. Internal architecture leaks into consumer copy

**Screen:** `/missions` ("PILLAR TWO"), `/safe` ("PILLAR THREE"), `/pulse`
("PILLAR ONE"), Home ("Information to action", "Safety Pulse")
**Observation:** The product's own internal structure is used as user-facing
navigation copy.
**Why it matters:** "Pillar" is a word from a pitch deck. It communicates
nothing to a user and signals institution.
**Principle:** Information scent, plain language, mental models.
**Recommended change:** Remove pillar eyebrows entirely. Replace institutional
phrasing with concrete consumer language.
**Implemented:** Yes

### H3. Provenance chips are so frequent they read as noise

**Screen:** all content screens
**Observation:** "PROTOTYPE CONTENT" appears six times in one viewport on Home
and on every card in Pulse and Missions.
**Why it matters:** The honesty requirement is non-negotiable and the label must
stay. But at this density it stops being information and becomes texture, and it
loudly tells the user they are looking at a demo. It also competes with the
category chip beside it for the same attention.
**Principle:** Signal-to-noise, alarm fatigue applied to labelling, visual
hierarchy.
**Recommended change:** Keep provenance visible and keep it on detail views and
anywhere a claim is made. In dense feeds, express it once per screen rather
than once per card. Never remove it from Norm Mirror aggregates, reward
partner claims, or the impact page, where it carries real weight.
**Implemented:** Yes

### H4. Mission types are structurally identical despite being fundamentally different

**Screen:** `/missions`
**Observation:** A two-minute scenario, a 25-minute field activity, a design
brief, a two-hour volunteering listing and a season-long challenge all render
as the same card with a differently coloured chip.
**Why it matters:** The user cannot tell at a glance what kind of commitment
each represents. A colour chip is a weak signifier for a category difference
this large.
**Principle:** Similarity implies equivalence, recognition over recall,
affordances and signifiers.
**Recommended change:** Differentiate by structure, not only by colour. Short
scenarios can be compact rows. Physical and long-form items deserve more
presence.
**Implemented:** Yes

### H5. A glossary footer is evidence the taxonomy is too complex

**Screen:** `/missions`
**Observation:** A closing paragraph lists all six mission type names and
explains the XP rule.
**Why it matters:** If the interface needs a legend, the cards are not
self-explanatory.
**Principle:** Recognition over recall, progressive disclosure.
**Recommended change:** Remove the glossary. Make the cards carry their own
meaning, and move the XP rule to where XP is actually shown.
**Implemented:** Yes

### H6. Pitch material is inside the product

**Screen:** Home (thesis card), `/safe` ("What SIDEQUEST deliberately does not
do"), `/you` (Safety Passport disclaimer), `/missions` (footer)
**Observation:** Several blocks exist to explain the product's philosophy to an
evaluator rather than to serve a user.
**Why it matters:** The thesis card is the last thing on Home and takes a full
card. The Safe policy block occupies the bottom third of the emergency screen.
**Principle:** Content density, one purpose per screen.
**Recommended change:** The honesty content stays in the product but moves
where it belongs. The Safe policy block moves below the primary paths and
becomes quieter. The Home thesis card goes; it is documentation, and
`docs/PRODUCT_SPEC.md` already carries it.
**Implemented:** Yes

### H7. Filter row overflows its container on a phone

**Screen:** `/missions` at 390px
**Observation:** Seven filters in a horizontally scrolling row, with the seventh
visibly clipped mid-word.
**Why it matters:** A clipped word reads as a rendering fault rather than as an
affordance to scroll. The edge fade helps but the cut falls mid-glyph.
**Principle:** Affordances and signifiers.
**Recommended change:** Reduce filter count and let the remaining ones scroll
with a cleaner edge.
**Implemented:** Yes

### H8. "Pulse" is an invented word in primary navigation

**Screen:** bottom navigation and desktop rail
**Observation:** NN/g's Menu-Design Checklist states the case directly:
*"Menus are not the place to get cute with made-up words, internal jargon, or
abstract high-level categorization."* "Pulse" has no information scent: a
first-time user cannot say what is behind it before tapping.
**Why it matters:** Two obvious mitigations do not hold up. Pairing an icon
does not rescue an invented word, because the evidence runs the other way:
text disambiguates icons (Wiedenbeck 1999 found label-only performed as well as
icon-plus-label, and both beat icon-only). And onboarding does not rescue it
either: NN/g's own study found tutorial readers performed no better than
skippers and rated the tasks as harder. The audience makes it worse rather than
better, since NN/g's teen research found teens read less well and have
markedly less patience than adults.
**Principle:** Information scent, plain language, recognition over recall.
**Recommended change:** Rename the tab to a concrete word. "Know" or "News"
would both carry scent. The route, the section brand and the documentation
could keep "Pulse" if that name matters to the pitch.
**Implemented:** **Yes, in the following pass.** This was originally recorded
as the single highest-confidence finding that was *not* acted on, because
renaming a product pillar is a brand decision rather than a UX one. The product
owner then made that decision, and the tab now reads **Updates**.

Scope of the change: the navigation label, the page heading and the route
metadata title. The route stays `/pulse`, because renaming URLs for cosmetic
consistency breaks links that have already been shared, and "Pulse" survives as
the pillar name in `docs/PRODUCT_SPEC.md` and in the pitch. The navigation
label's job is prediction; the brand's job is elsewhere.

The page heading moved too, not just the tab. A destination that answers to a
different name than the control you tapped leaves the user checking whether
they arrived.

**Safe** and **Missions** are milder cases of the same issue and were kept:
both are ordinary words that describe what is behind them.

---

## Medium

### M1. The level card occupies the best space on Home and is not actionable

**Screen:** `/`
**Observation:** The first card below the greeting is Level, XP, a progress bar
and a sentence explaining the product's progression philosophy.
**Why it matters:** Prime above-the-fold space is spent on a status readout and
a design rationale, neither of which is something to do.
**Principle:** Visual hierarchy, thumb reach and above-the-fold priority.
**Recommended change:** Compress progression into the existing XP chip in the
header. Keep the full readout on `/you`, where the user went to look at it.
**Implemented:** Yes

### M2. Six competing exits on one screen

**Screen:** `/`
**Observation:** "See all", "All missions", "All Campaigns", "Open", "All
stations", "Rewards" all present simultaneously.
**Why it matters:** Every exit dilutes the scent of the others.
**Principle:** Information scent, choice overload.
**Recommended change:** At most two secondary exits. The tabs already provide
navigation to everything.
**Implemented:** Yes

### M3. Pulse reads as a wall of crime categories

**Screen:** `/pulse`
**Observation:** Eight stacked cards, each led by a category chip drawn from
SCAMS, CYBER, YOUTH, SAFETY, COMMUNITY, and each carrying an identical "Try the
related quest" footer.
**Why it matters:** The brief for SIDEQUEST is explicit that it must not make
Singapore feel unsafe. A uniform column of threat categories does exactly that,
and the repetition of the same call to action on every card devalues it.
**Principle:** Attentional salience, similarity, framing.
**Recommended change:** Lead with one thing worth knowing. Reduce chip
repetition. Keep the Pulse-to-Mission flow, which is the signature interaction,
but stop repeating it identically eight times.
**Implemented:** Yes

### M4. "3 of 11 completed" frames Missions as a syllabus

**Screen:** `/missions`
**Observation:** A completion counter directly under the page title.
**Why it matters:** A denominator turns a catalogue into a checklist and implies
an obligation to finish.
**Principle:** Framing, motivation (autonomy over compliance).
**Recommended change:** Remove the denominator from the browse screen. Progress
belongs on `/you`.
**Implemented:** Yes

### M5. "Everything else" is a dismissive header for the largest section

**Screen:** `/missions`
**Observation:** The eight-card main list sits under the heading "Everything
else".
**Principle:** Information scent.
**Recommended change:** Name the section for what it contains.
**Implemented:** Yes

### M6. Campaigns are visually smaller than the missions above them

**Screen:** `/missions`
**Observation:** The Campaign entry is a single compact card below three larger
signature mission cards.
**Why it matters:** Campaigns are the most distinctive thing in the product and
currently rank fourth on the screen that should sell them.
**Principle:** Visual hierarchy.
**Recommended change:** Give Campaigns real presence on both Home and Missions.
**Implemented:** Yes

### M7. Safe includes browsing destinations among help destinations

**Screen:** `/safe`
**Observation:** "Police advisories" and "National Crime Prevention Council" sit
in the same list as "Police emergency" and "I-Witness".
**Why it matters:** These are reading destinations, not help destinations. They
lengthen the list a stressed user must scan, and Pulse already links to
advisories.
**Principle:** Categorisation, progressive disclosure.
**Recommended change:** Separate them from the help paths, visually and
semantically.
**Implemented:** Yes

### M8. Handoff microcopy is a full sentence on every card

**Screen:** `/safe`
**Observation:** "Opens the SPF e-services directory. The Police@SG app is
listed there too."
**Why it matters:** Telling the user what will happen before they tap is
correct and should be kept. Doing it in a full sentence on every card, in a
stress context, is too much reading.
**Principle:** Error prevention versus cognitive load, plain language.
**Recommended change:** Keep the promise, shorten it to a fragment.
**Implemented:** Yes

---

## Low

### L1. Radius is uniform across every surface

**Principle:** Radius as a hierarchy signal.
**Recommended change:** Vary radius deliberately between hero, card and row.
**Implemented:** Partially. Hero and compact rows now differ from the standard card.

### L2. Every card carries a one-pixel border

**Observation:** Borders are doing grouping work that whitespace could do more
quietly.
**Implemented:** Partially. Borders reduced on list-like content.

### L3. The greeting depends on the device clock and can read oddly

**Observation:** "Late night, Lucas" appeared during testing at 00:30.
**Assessment:** Correct behaviour, and arguably charming. No change.
**Implemented:** No, deliberately.

### L4. Desktop is a single centred column

**Observation:** At 1440px the content is one column at `max-w-[64rem]` beside
the rail, so cards become very wide.
**Implemented:** Partially. Home now uses a two-column arrangement below the
hero at large widths; the rest is acceptable for a phone-first product.

---

## Track B alignment

Added after the audit began, in response to the Crime Prevention guardrail. The
challenge is youth crime prevention through peer-driven approaches, and its
named behavioural drivers are peer pressure, impulsive decision-making, poor
risk awareness, desire for social acceptance and limited understanding of
consequences.

### A1. The product read scam-first at exactly the points seen first

**Severity:** High
**Observation:** The three signature missions were already well aligned:
REWIND is peer pressure and shop theft, Norm Mirror is peer norms, BREAKSAFE is
situational prevention of shop theft. But the surfaces a new user or a judge
meets first were dominated by scams. Home's hero story was job scams. Home's
featured quest was an OTP scam. Four of eight Pulse items were scam or cyber,
and the top three of the feed were consecutive scam stories.
**Why it matters:** A judge assessing against the Crime Prevention statement
would have seen a scam-education product in the first thirty seconds, with the
youth-offending work buried below the fold.
**Change:** The featured Pulse item is now "The quiet cost of going along with
it", a peer-pressure piece that hands off to REWIND. The feed is reordered so
peer pressure, self-checkout design and account lending lead, with scam items
present but lower. Home's hero is the Campaign, whose story is peer pressure, a
shop-theft moment and an account lent to a friend.
**Result:** There is now no scam content above the fold anywhere in the default
consumer journey. Scam material remains a legitimate part of the catalogue,
because money mule recruitment is a real youth offending pathway, but it is no
longer what the product leads with.
**Implemented:** Yes

### A2. The "For you" sort silently promoted scam content

**Severity:** High
**Observation:** A genuine bug rather than a content choice. The Pulse feed
scored relevance by checking whether a content **category** string appeared in
the user's **interests** list. Those are two different vocabularies that happen
to share one word. "scams" matched; "youth" did not, because the interest is
called "peer-pressure". So the default seeded profile sorted every scam story
above every peer-pressure story, permanently.
**Change:** An explicit interest-to-category map, and recency as the primary
sort with an interest match worth a six hour head start rather than an
override.
**Implemented:** Yes

### A3. Campaign chapter one framed a youth as a scam victim

**Severity:** Medium
**Observation:** "Quick money" opened with an outside recruiter messaging Ilyas
a job offer. Mechanically it was already about account misuse and it already
had a peer pushing him, but the framing made the antagonist external, which
reads as scam education rather than youth crime prevention.
**Change:** Retitled "The favour" and reframed so the ask comes from **Ken,
standing right there**, as a favour between friends. Nothing external pressures
Ilyas; his friend does, in front of the group, and what is being asked for is
his identity. The pivot, the five response options, the outcomes, the
behavioural mechanism and the skill awards are unchanged.
**Why this improves alignment:** It restores the brief's actual driver set.
Peer pressure is now the mechanism rather than the backdrop, social acceptance
is the motive ("Jas laughs and says Ilyas is scared"), and the consequence
lands on the young person who said yes rather than on a distant fraudster. The
outcome text makes the point explicitly: *"Ken is not the one being asked to
explain it."*
**Behavioural integrity:** Preserved. Still decision rehearsal, still graded by
face cost, still no operational detail, still no instant-arrest ending.
**Implemented:** Yes

### A4. Scam utility correctly stays under Safe

**Severity:** None, verified rather than changed
**Observation:** ScamShield and the 1799 helpline sit inside Safe as one of
four paths, which is where utility belongs. They are not part of consumer
discovery, and the Safe redesign did not promote them.
**Implemented:** No change needed

---

## Deliberately not changed

**Dark mode only.** Assessed against the brief's criteria. Surfaces are
differentiated (`ink-900` page, `ink-800` card, `ink-700` raised), contrast
passes AA everywhere after the earlier token fix, and the palette is not
predominantly purple: violet is one of five accents and is used for navigation
and brand, not as a background wash. Light mode is feature scope and is
deferred. Recorded in `docs/UX_RESEARCH.md`.

**Echo.** Reviewed. Echo is already restrained: a geometric mark rather than a
face, four moods, and lines that observe rather than congratulate ("That is
peer influence, working in the direction you chose"). The tone rule is right.
Only the placement was adjusted so Echo does not open a chapter before the
story does.

**Onboarding.** Four short steps, all skippable in effect (only age band has a
default that matters), and the QR path already bypasses it entirely. The
friction is low and the age band genuinely changes what surfaces first. Kept.

**The behavioural content.** No debrief, mechanism or outcome text was weakened.
This pass changed presentation and hierarchy, not the substance of any mission.

---

## Future opportunities, not implemented

Recorded rather than built, per the no-feature-creep constraint:

- Light mode.
- A real "drop" schedule with rotating content, which would need a content
  pipeline rather than a presentation change.
- Push notifications for Campaign follow-ups.
- Per-crew custom challenges.
- A shareable Campaign completion card.
