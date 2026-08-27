# SIDEQUEST Streets art direction

The district's visual system. Extends `docs/VISUAL_ART_DIRECTION.md` rather than
replacing it: the mascot, cast portraits and mission marks are unchanged, and
the world adds a brighter register beneath them.

---

## Originality

**Every pixel in District 01 is drawn in code at runtime.** No sprite sheet, no
tile atlas, no downloaded asset, no stock art, no AI imagery. `public/` contains
no game asset of any kind, and `docs/ASSET_LICENSES.md` does not exist because
there is nothing third-party to declare.

That is a decision, not a shortage. It means nothing to license, nothing to
fetch at a roadshow, one visual vocabulary, and no possibility of a ripped
sprite reaching the repository.

### The originality test

Applied deliberately, because the brief is explicit about it:

| Could this be mistaken for a specific existing game? | Answer |
| ---------------------------------------------------- | ------ |
| Creature collection | No. Echo is one companion, already the product's mascot, with five cosmetic variants and no capture, battling, evolution or types. |
| Trainer sprite | No. The avatar is a layered geometric figure with no hat, no bag, no outline style borrowed from anywhere. |
| Tile art | No. Every tile is a flat vector fill, drawn from primitives on a 16-unit grid, with no dithering, no black outlines and no 8-bit palette limitation. |
| UI frames | No. Dialogue is the product's own DOM sheet, using SIDEQUEST's existing card, type and colour system. |
| Terminology | No. Chapters, missions, crews, quests and Echo are all the product's existing words. |

The aesthetic reference is *the genre's interaction grammar*: top-down movement,
approach, talk, decide. Not any game's assets.

---

## Geometry

- **Tiles are 16 world units.** Everything snaps to that grid.
- **The world buffer is 320 x 232 units**, blitted up with smoothing disabled.
  That is what makes vector drawing read as crisp low-resolution art.
- **Flat fills, no gradients, no dithering, no outlines.** Depth comes from a
  ground shadow and from depth-sorting, never from strokes.
- **Corridors are three tiles wide.** Two is walkable and makes the player fight
  the geometry.

---

## Palette

Bright, warm and green. The shell stays dark; the world is where the colour
lives, and the contrast between them is deliberate: stepping outside should feel
like stepping outside.

| Role | Colour | Note |
| ---- | ------ | ---- |
| Grass | `#3f7a46` / `#478a4e` | Checkered, with a deterministic tuft scatter |
| Path | `#c8bda4` / `#bfb298` | Warm pavement |
| Covered walkway | `#d6cdb8` with `#9aa0ac` posts | Beams only at the ends of a run |
| Road | `#5a5f6b`, stripes `#d9dee6` | Zebra crossings at three points |
| Court | `#7a6bd6` | The one saturated ground surface |
| Block facade | `#e8e2d4`, roof `#2f4a86` | Windows in `rgba(52,72,120,0.75)` |
| Quest marker | `#f5b93f` | A SIDEQUEST spark, never an exclamation mark |

### Shopfront signs

Each block gets one sign colour so it is identifiable from across the district:
minimart coral, void deck violet, kopitiam gold, bus stop cyan, community post
**blue**.

---

## Institutional influence, and its hard limit

The brief asked for SPF and NYC visual DNA. I checked both sources directly
before using anything.

`police.gov.sg` renders blue, grey and white and publishes **no hex values and
no brand usage guidelines** on the public site. `nyc.gov.sg` serves its mark as
`NYC_2025_Logo_RGB.png` and likewise publishes **no hex values and no logo usage
rules** on its homepage.

Two conclusions, and the second matters more.

Any hex I labelled "official" would be invented, because neither organisation
publishes one where it could be checked. Sampling a logo and calling the result
an official colour would be fabrication dressed as diligence.

**An absence of published usage rules is not permission. It is an absence.**

So:

- Colours here are **SIDEQUEST-owned and institution-inspired**, never described
  as official.
- **No crest, no uniform, no chevron, no logo, no wordmark** from either
  organisation appears anywhere.
- **Nothing claims or implies endorsement**, partnership, official status or
  "powered by".
- **Red is reserved for urgency.** It is never a generic call-to-action colour,
  which also preserves the standing rule that exactly one element on Safe is red.
- The community post uses institutional blue because trust matters at that door.
  It is a colour, not a badge.

---

## Characters in the world

The cast are the same people as the campaign: Ken, Rina/Jas, Ilyas, Mr Tan,
Nadia, Arif. Recurring characters make a district feel like a place rather than
a menu.

World sprites are composed at draw time from legs, torso, arms, head and a hair
silhouette. Direction changes the hair silhouette and which eyes are drawn, so
turning reads without a sprite sheet.

### Three prohibitions, and none of them is stylistic

**No NPC signals criminality.** Not by clothing, not by skin tone, not by
posture, not by a "shifty" idle. Every NPC is a neighbour. A world that draws
offenders teaches profiling, and this product's first rule is that it does not
profile people.

**No police roleplay.** No chasing, no arresting, no patrol, no uniform, no
combat. The hero action in this district is noticing, pausing, redirecting,
verifying and redesigning.

**No realism.** The figures are geometric and small. A realistic face invites
the reading that appearance predicts behaviour.

---

## Quest markers

A small gold diamond above an NPC who has something available, bobbing gently
and stopping dead under reduced motion.

It means **there is something here**. It does not mean *this person is
suspicious*, which is why it is a spark rather than an alert glyph, and why the
same information is carried in words in the Quest List.

---

## Motion

- The camera follows and clamps at the district edges. No shake, no zoom, no
  spring.
- The marker bob and Echo's float are the only ambient motion, and both stop
  under `prefers-reduced-motion`.
- The walk cycle is four frames of leg swing and a one-pixel body bob.
- Nothing is carried by animation. The reduced-motion world is the same world.

---

## Echo in the world

The equipped variant follows the player through a short position history, so it
trails rather than overlaps and never blocks a doorway. It is drawn from the
same shield silhouette and visor as the mascot, at world resolution.

This is the point of the collection: a cosmetic that was previously a tile on a
settings screen is now a companion you walk around with. Locked variants stay
locked, and no new progression system was added.

---

## Prohibited

- Sprite rips, tile packs of unverified provenance, asset-store maps.
- Any real map, address or property layout. District 01 is fictional.
- Retro parody, 8-bit meme aesthetics, deliberate ugliness as a joke.
- Dark cyberpunk Singapore. This is a youth neighbourhood in daylight.
- Anything childish enough to undercut what the district is actually about.
