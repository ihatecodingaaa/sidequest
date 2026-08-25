# Sources

Where the factual content in SIDEQUEST comes from, and what is ours.

## How to read this

SIDEQUEST content falls into three categories:

1. **Official links and numbers.** Real, checked against the live site.
2. **Original summaries.** Written by the SIDEQUEST team, drawing on themes that
   appear in publicly available Singapore advisories. No article text is copied.
3. **Invented material.** Norm Mirror percentages, crew members, the partner
   challenge brief, prototype locations. All labelled in the product.

If it is not in category 1, it is not a citation.

## Official destinations used in the app

All checked and returning a live page on **25 August 2026**. Defined in
`src/lib/official-links.ts`.

| Destination                        | URL or number                        | Owner                            |
| ---------------------------------- | ------------------------------------ | -------------------------------- |
| Police emergency                   | 999                                  | Singapore Police Force           |
| ScamShield Helpline                | 1799                                 | ScamShield                       |
| Police hotline, non-emergency      | 1800 255 0000                        | Singapore Police Force           |
| ScamShield                         | https://www.scamshield.gov.sg        | ScamShield                       |
| I-Witness                          | https://www.police.gov.sg/iwitness   | Singapore Police Force           |
| Police e-services                  | https://www.police.gov.sg/e-services | Singapore Police Force           |
| Police advisories                  | https://www.police.gov.sg/Advisories | Singapore Police Force           |
| National Crime Prevention Council  | https://www.ncpc.org.sg              | NCPC                             |

Notes:

- `scamalert.sg` now redirects to the ScamShield website, so the app links to
  `scamshield.gov.sg` directly and lists NCPC separately.
- The Police@SG app is reachable through the SPF e-services directory rather
  than a separate deep link, which is what the handoff copy says.

## Discovery destinations

| Destination           | URL                                              | Publisher |
| --------------------- | ------------------------------------------------ | --------- |
| CNA Singapore         | https://www.channelnewsasia.com/singapore         | CNA       |
| CNA scam coverage     | https://www.channelnewsasia.com/topic/scams       | CNA       |
| meLISTEN              | https://www.melisten.sg                           | Mediacorp |

meLISTEN is a single-page app that answers HTTP 200 for unknown paths, so
individual station deep links cannot be verified from outside. Every station in
the app therefore links to the verified root and lets the official player
handle station selection. This is documented in `src/data/radio.ts`.

Neither CNA nor Mediacorp has any relationship with SIDEQUEST. We link to their
own sections and never reproduce their content.

## Themes behind the seeded Pulse content

Each Pulse item is an original summary. The underlying subjects are drawn from
themes that appear repeatedly in Singapore public advisories from SPF, NCPC and
ScamShield, and each item links to the advisory index of the authority it
names:

| Item                                | Theme                                              |
| ----------------------------------- | -------------------------------------------------- |
| Job offers that pay too well        | Job scams and money mule recruitment                |
| Nobody legitimate needs your OTP    | OTP and one-time password social engineering        |
| Deals that only work if you leave the app | E-commerce and resale platform scams          |
| The quiet cost of going along with it | Peer influence and bystander behaviour            |
| When the machine makes the honest thing hard | Retail self-checkout loss and design       |
| The account you lent out is still yours | Account, SIM and bank account lending           |
| A familiar voice is no longer proof | Synthetic voice and impersonation                   |
| Prevention that happens on a Saturday | Community prevention volunteering                 |

We have deliberately not cited specific advisory pages or news articles against
individual items, because doing so would imply those bodies wrote or endorsed
our summary. The link goes to the authority's own index, and the provenance tag
says the summary is ours.

## Behavioural science behind the missions

Each signature mission names its mechanism in the product itself, on the mission
detail page under "Why this works".

**Norm Mirror: perceived versus actual norms.** The social norms literature
consistently finds that people overestimate how common risky behaviour is among
their peers, and that the misperception itself sustains the behaviour. Social
norms approaches have been applied widely in substance use and campus safety
research, with mixed but real effects, and are strongest when the corrected norm
is local and credible to the audience.

*What we claim:* the direction of the effect and the mechanism.
*What we do not claim:* the specific percentages in the prototype, which are
placeholders. See `docs/DATA_SAFETY.md`.

**REWIND: decision rehearsal and implementation intentions.** Deciding in
advance what you will do in a specific situation is more predictive of
behaviour than a general intention to behave well. Bystander research also
consistently finds that people are more likely to act when someone else moves
first, and less likely when everyone is waiting. REWIND targets both: it makes
you the first mover, and it gives you a sentence you have already said once.

**BREAKSAFE: situational crime prevention.** The tradition running through
Clarke's situational crime prevention and Cornish and Clarke's rational choice
perspective treats opportunity and effort as the levers, rather than disposition.
The corollary that matters here is that changing an environment applies to
everybody equally and requires no judgement about who anybody is, which is
exactly what makes it compatible with a privacy-preserving product.

Retail research on self-checkout also distinguishes deliberate theft from
unintentional non-scanning, and finds the second group substantial. That
distinction is the entire premise of the mission.

**Reward design: self-determination theory.** Autonomy, competence and
relatedness. The relevant finding for us is that tangible extrinsic rewards can
undermine intrinsic motivation for an activity someone already finds worthwhile.
That is why the reward curve puts recognition at the bottom and vouchers at the
top, and why the pilot proposes measuring whether the voucher tier changes
completion rates at all.

## Challenge context

Delta Challenge 2026, Track B: Crime Prevention. The brief describes existing
Singapore measures including school talks, MOE collaboration, advisories,
Student Learning Space modules, Police Message Boards, Coffee with a Cop,
roadshows, NCPC programmes, retailer collaboration, social media, games,
community engagement, Police@SG, Community Watch and ScamShield.

SIDEQUEST is positioned as the participation layer on top of that provision,
not a replacement for any of it.

## Everything that is invented

For completeness, so nobody has to guess:

- All Norm Mirror percentages.
- All crew names, members and weekly totals.
- The self-checkout Partner Challenge, its brief, its constraints and its sample
  entries.
- The Tampines Field Quest siting and its check-in code.
- All reward concepts and their potential partners.
- The demo profile loaded by "Load demo progress".
- Recency labels on Pulse items.

Each of these is labelled in the product with a provenance tag or explicit copy.
