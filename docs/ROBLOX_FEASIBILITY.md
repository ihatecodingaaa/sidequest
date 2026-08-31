# Roblox feasibility

A tester suggested deploying SIDEQUEST on Roblox, "because many teens play it".
This is the assessment of that idea. Nothing was built.

**Researched:** 31 August 2026, against official Roblox sources.
**Verification:** the two Roblox research reports behind this document were put
through an independent adversarial fact-check that re-fetched every cited source
and string-matched every quotation. It found **no fabricated clause, no
misquotation and no out-of-date policy presented as current**, and returned four
sourcing-precision corrections, all of which are applied below.

---

## Verdict

**Now: the PWA remains canonical, and it is not close.**

**Future: Roblox could become a discovery channel, never the whole product, and
`Safe` would stay on the web regardless.**

The suggestion is a reasonable one and the audience premise is broadly right. It
fails on three specific things, and the first of them alone is decisive.

---

## The three blockers

### 1. A Roblox experience cannot link out. `Safe` cannot exist there.

Roblox's Community Standards prohibit directing users off-platform. The Social
Links feature, which is the sanctioned exception, accepts only seven platform
types (Facebook, Twitter, YouTube, Twitch, Guilded, Discord, and the Roblox
group), so **there is no link type that accepts a `.gov.sg` URL**. There is no
engine API for opening a browser: the published `GuiService` reference lists 17
methods and none of them opens a URL, and the legacy social-link field on
`PolicyService` "is a legacy field. It always returns an empty array".

Even where a social link is permitted, it is **hidden from users under 16**, and
the creator-side UI for adding one is itself gated behind facial age estimation
or government ID.

SIDEQUEST's entire `Safe` tab is outbound links to official Singapore services,
and the no-redistribution rule means every Pulse story links out to the
authority's own page. On Roblox none of that can be a link, and it cannot be
spoken in chat either, because Roblox automatically filters "instructions on how
to move off the platform".

Whether an experience may display a static emergency number such as 999 is
**genuinely unresolved**. No official Roblox text addresses a creator displaying a
public emergency number; the "telephone number" rule in the Community Standards
is about personal contact details. The defensible reading is that a three-digit
public emergency number is not what that rule protects, but it is a reading, not
a permission, and it would need written confirmation before shipping.

> A Roblox version of SIDEQUEST could not carry Safe. That is not a limitation to
> design around. It is the reason the web app stays the product.

### 2. Any discussion feature sits behind a biometric age check

Roblox now requires an age check before chat. That is facial age estimation from
a selfie, or government ID. The bands are roughly under 9, 9-12, 13-15, 16-17,
18-20 and 21+, minors talk to their own band plus explicitly trusted people, and
adults are kept out by default.

Two consequences.

It is a hard funnel step nobody controls. A school or community pilot cannot
assume a room of thirteen-year-olds will all complete a facial check on the day,
and a facilitator cannot batch-create accounts.

And it collides with a SIDEQUEST non-negotiable. The product forbids facial
recognition outright. SIDEQUEST could not adopt Roblox's safety architecture even
if it wanted to, and it should not imply Roblox-equivalent protection: SIDEQUEST
has **no age assurance at all**. Its protection is a different and defensible one,
which is that there are no accounts, no stored contact details and no open
discovery.

### 3. It is a full rewrite, with no reuse and no shell

Luau is not TypeScript, and there is no supported way to embed or wrap a web app
inside a Roblox experience. What transfers is **non-code**: copy, narrative beats,
data files re-expressed as Lua tables, the information architecture, the design
decisions already argued out, and the test scenarios. Every line of application
logic is rebuilt.

That makes the decision binary: either maintain two independent products with two
codebases, two content pipelines and two moderation surfaces, or replace the PWA.
The ongoing double-maintenance cost is the number that matters, not the build
cost, because every future copy change and every `official-links.ts` update would
have to be made twice.

---

## The audience premise, checked

The tester's premise is broadly right and more qualified than it sounds.

| Claim | What the official record says |
| ----- | ----------------------------- |
| Roblox is huge | 123 million DAU as of Roblox Q2 2026, reported 30 July 2026 |
| Roblox is growing | **No.** It is contracting. Any plan depending on Roblox growth is betting against recent published evidence |
| Roblox publishes DAU by age band | **It stopped**, in the Q4 2025 report published February 2026 |
| Teens are a big share | Among users who had completed an age check as of 30 June 2026, 38% were aged 13 to 17. Roblox states this subset may not represent the platform overall |
| Singapore usage | **No official country-level figure exists.** Singapore sits inside APAC, Roblox's largest region at 41M DAU, +15% YoY, and its least monetised at roughly one eighth of US and Canada revenue per DAU |

The age figure needs all three qualifiers or it is dishonest: the number, the
date, and the denominator. 38% of a 57% age-checked subset does not let anyone
compute how many 13-to-17-year-olds are on the platform. A share can be stated; a
count cannot.

The 13-to-17 band is the fastest-growing part of the youth audience, which is
genuinely good news for the premise. But Roblox's own investment is flowing to
over-18 content: 2D and single-player games aimed at over-25s, a DevEx premium of
50% for games consumed over 18, an incubator for O18 content. A youth
crime-prevention presence would sit outside the platform's growth priority.

**No Singapore Roblox penetration number may appear on any SIDEQUEST screen or in
any deck.** None exists.

---

## The rewards problem

The prototype rewards counter would not port, and this is worth stating precisely
because it is the part most likely to be assumed away.

Robux and virtual items carry **no equivalent value in real currency** under the
Terms of Use. A developer **cannot independently run** a contest, sweepstake or
competition with a real-world prize: the Community Standards state that such
promotions "must be created in contractual agreement with Roblox". "First 50
players to finish the mission get a voucher" is not shippable by a developer
alone.

Roblox does permit promotional offers for virtual rewards under five conditions,
including that the reward is pre-determined, opt-in, never a progress gate,
granted immediately, restricted to players 13 and over, and carries **no per-user
codes**. Under-13 players may not be incentivised to engage with advertising
content at all, which for a youth prevention audience is an architectural split
rather than a copy change.

Naming a partner organisation on a rewards screen is very likely **advertising**
under Roblox's own definition, requiring registration, a visible in-experience
disclosure naming the advertiser, and Roblox's own ad tools rather than a
hand-rolled panel. Budget roughly a week of pre-approval.

A redemption flow that sends a player to a partner's website, or shows a QR code,
is not deliverable inside an experience at all.

None of this is a defect in the product as it stands, because the vouchers are
already non-monetary, already labelled `partner-concept`, and
`isConfirmedPartner` is already `false` everywhere with a unit test holding it
there. It is a **deployment gate**: keep the in-experience reward layer and the
real-world partner layer separable in code, so the real-world layer can be
removed wholesale for any Roblox build.

The deterministic, free, non-scarce, non-expiring cosmetics model the product
already uses is the shape that avoids the paid-random-items regime entirely. That
is worth noting as a point in the current design's favour: refusing loot boxes was
a values decision that turns out also to be the compliant one.

---

## What else would be lost

**The cold start.** A campaign QR scan currently opens a chapter on a completely
cold device. A Roblox session requires an account, an install, an unblocked
network and a server invite. That property is the single thing that makes the
roadshow deployment work, and it does not survive.

**Accessibility.** `ReducedMotionEnabled` and `PreferredTextSize` exist, so the
reduced-motion discipline and scalable type carry over. There is **no
assistive-technology fallback**, which makes the existing rule that state is
carried by shape, icon, label and position even more load-bearing, with nothing
behind it. Treat this as a genuine and probably irreversible regression, and put
it on the decision record rather than discovering it at review.

**Reaching the youngest band.** Publishing to the 9-to-12 tier depends on
benchmarks including 250 unique plays in 60 days from engaged, age-checked
players. That is a chicken-and-egg problem a closed pilot cohort cannot solve, and
a crime-prevention product for youths that cannot reach 9-to-15-year-old accounts
has no audience. **This is the finding most likely to kill a port outright, and it
should be tested before any engineering.**

**Content rating.** Peer pressure, shop theft, account misuse and impulsive-choice
scenarios are likely fine at Mild, but a Moderate or Restricted label would price
the target age group out entirely. The maturity questionnaire should be completed
honestly against the existing content **before writing any Luau**; it is the
cheapest way to discover whether the product is publishable to its intended
audience.

**Filtering the youth-created drafts.** Text is filtered per-viewer, so the same
stored string renders differently to different players. A filter tuned for child
safety will mangle exactly the vocabulary a prevention scenario about theft or
coercion needs. And Roblox's silent rephrasing is the part that most annoys teen
writers, which is a real problem for a feature whose whole point is authorship.

---

## What is worth stealing anyway

Several Roblox patterns are good design regardless of platform, and three have
been adopted or confirmed by this review:

- **Banded audiences rather than a minor/adult binary.** The honest web equivalent
  is under-13, 13-15, 16-17, 18+.
- **Proof-of-real-life pairing.** Roblox's Trusted Connections requires an
  in-person or address-book act, never a link a stranger sends. If SIDEQUEST ever
  adds an adult-to-youth channel, the pairing should be established offline
  through the school or programme.
- **A crew is a closed room, not an open code.** This review is part of why the
  crew list is now tappable rather than code-driven, and it is an argument against
  ever making an open crew code joinable by an unknown adult.
- **Filter on write, re-filter on read.** A draft accepted from a sixteen-year-old
  should be re-checked before a twelve-year-old sees it, and if anything is
  changed the writer should be shown what, rather than being silently rephrased.
- **No voice.** Roblox, with a far larger safety organisation, still gates voice
  behind an age check and its own documentation is internally inconsistent about
  the 9-12 case. A text-and-tap crew discussion avoids the whole class of problem.

---

## If it were ever done

Not a recommendation. A shape, so that nobody has to invent one under time
pressure.

**Roblox teaches and rehearses. The web app carries the safety payload.**

The world would run scenarios and reveals with no side channel, no linking, and
no crew discussion. Safe would remain on the web, reached by the player on a
surface they are already holding rather than launched by the experience. The two
would share content and share nothing else.

Before any engineering, in this order:

1. Complete the content maturity questionnaire against existing content.
2. Model honestly whether a closed pilot cohort can ever clear the 9-to-12
   publishing benchmark. If it cannot, stop.
3. Run one real session on actual school hardware and the actual school network.
   The failure modes here are institutional, not technical.
4. Nominate an owner for ID verification and 2FA now; those have independent lead
   times.
5. Run a two-week Luau spike rebuilding one self-contained mechanic end to end,
   including publish and moderation, and size the rest from that measured
   velocity rather than a web-derived estimate.

And adopt Rojo plus Git from the first commit. Retrofitting a file-system-first
layout onto a Studio-native place is expensive, and note that the repository stops
being the single source of truth: the place file and its published versions live
in Roblox's cloud.

---

## A standing caveat

`about.roblox.com/community-standards` is the single most-cited source here and it
**publishes no revision date and no change log**. The Advertising Integrations
Policy took effect on 4 May 2026 and a revenue share lands on 1 January 2027. The
help articles are being revised weekly.

Every clause in this document needs re-reading against the live page immediately
before any Roblox commitment. Nothing here should be cited from this stored copy
in a submission or a pilot document without being re-checked on the day.

---

## Sources

Official Roblox sources read directly on 31 August 2026: Terms of Use (Help
Center article 115004647846, effective 19 May 2026); Community Standards
(about.roblox.com/community-standards, no revision date published); Advertising
Standards (article 13722260778260, in-body "Last Updated: June 5, 2026");
Commerce Standards (article 36495190721172); Social Media Links (article
360000910966); Safety & Civility (article 4407444339348); Promo Offers for
Virtual Rewards (article 10549651908244); Roblox Name and Logo Community Usage
Guidelines (article 115001708126); and create.roblox.com documentation for
`GuiService`, `PolicyService`, social media links, chat guidelines, Developer
Exchange, Paid Random Items, Ad Integrations and Marketplace Policy. Audience
figures from Roblox Q2 2026 results and shareholder letter, reported 30 July 2026.

One attribution flagged by the fact-check and corrected here: two sentences
originally attributed to the Terms of Use regarding DevEx discretion could not be
located in that document and most likely belong to the separate DevEx Terms. The
substantive point survives on the clause that **is** confirmed in the Terms of
Use: "Except as otherwise outlined in the DevEx Terms with respect to Creators who
have applied and been accepted to the DevEx Program, Robux cannot be redeemed for
any real currency."
