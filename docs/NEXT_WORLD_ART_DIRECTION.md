# Next world art direction

The visual system for the upgraded District 01: light, materials, buildings,
interiors, orientation and the minimap.

`docs/STREETS_ART_DIRECTION.md` remains the standing document for what may and
may not be drawn at all: originality, the character rules, the three
prohibitions. Nothing here relaxes any of them. This document covers how the
world is lit and built, which is what changed.

---

## The one lighting rule

**Light comes from the top left. Everything obeys it.**

That is the whole model, and it is the single change that did the most work.

The first cut of the district was flat fills. It was legible and it looked like
a diagram, because with no light direction there is no depth, and with no depth
nothing looks built: a path and a wall are just two different colours sitting
next to each other.

Every surface now carries three tones.

| | Role |
| - | ---- |
| **base** | The fill |
| **light** | Top and left edges, where the surface meets a different one |
| **shade** | Bottom and right edges, same rule |

A path drawn this way sits **in** the grass rather than beside it. A wall has a
top. A bench casts down onto the ground it stands on.

### Bevels are between surfaces, not between tiles

A tree and a bench stand **on** grass, so they belong to the grass surface.
Comparing raw tile codes drew a light rectangle around every one of them, and a
park bench ended up looking like it was sitting in a box.

`surface()` in the renderer groups codes:

| Surface | Codes |
| ------- | ----- |
| ground | grass, tree, bench |
| paving | path |
| covered | walkway |
| court | court |
| road | road, crossing |
| floor | interior floor, doormat |

Bevels are drawn only where one surface meets another.

---

## Palette

Bright, warm and green outdoors. The shell stays dark, so stepping into the
world should feel like stepping outside.

| Role | Base | Light | Shade |
| ---- | ---- | ----- | ----- |
| Grass | `#4a8f52` / `#4f9457` | `#62a869` | `#3c7845` |
| Path | `#d8cdb2` / `#d0c4a7` | `#e6dcc4` | `#b3a68a` |
| Covered walkway | `#c3b79b` | | `#a2967a` |
| Road | `#5f646f` | `#6d727d` | stripes `#e2e7ef` |
| Court | `#6f5fd0` | `#b9adff` | `#5b4cb4` |
| Block facade | `#efe9db` | `#cfc6b2` | `#b3a894` |
| Roof | `#2f4a86` | `#3f5da3` | |
| Tree | `#2f6a3c` | `#4f9b58` | `#255630` |

Two of these are decisions rather than colours.

**The grass checker is deliberately faint.** A strong two-tone reads as a
chessboard rather than as ground. The deterministic tuft scatter is what
actually stops a park from looking flat, and the flowers are rare enough
(roughly one tile in thirty-seven) to feel found rather than placed. Any denser
and they read as litter.

**A covered walkway is darker than the open path beside it,** because it is in
shade. The first cut made it lighter and the main street became one wide beige
band with a couple of hairlines through it.

### Indoors

Warmer and lower contrast, because a room is not a street.

| Role | Colour |
| ---- | ------ |
| Floor | `#cfc3ad` / `#c7bba4`, grout `#aea281` |
| Shelving | `#8a6a45`, lit `#a88257` |
| Counter | `#e8dfcb`, edge `#b9ac93` |
| Machine | `#aeb6c6`, dark `#7d8598`, screen `#2b3a5c` |
| Noticeboard | `#c9b98a`, dark `#9c8d66` |
| Walls | `#3b3d49`, skirting `#4c4f5d` |

---

## Buildings

A block is a facade, not a rectangle. In order, from the top:

1. **Roof** in the district blue, with its own lit top edge.
2. **Fascia** in the block's own sign colour.
3. **Window rows.** A handful are lit, chosen by a stable hash so the same
   units are on every time. A block where every window is identical looks
   empty; one where they flicker looks broken.
4. **Awning** over the door, in the block's colour. This is what makes a
   doorway findable from across the district without a label on it.
5. **Doorway**, centred on the landmark's own door tile.
6. **Ground shadow** in two bands, so the block sits on the map.

The geometry is stated in the data, never inferred. An earlier version derived
the rect from the landmark's door position and put a roof in the middle of the
basketball court.

### Shopfront colours

One per block, so it is identifiable from anywhere: minimart coral, void deck
violet, kopitiam gold, bus stop cyan, community post blue.

**A room is the colour of its own sign.** Walk into the coral shop and the
skirting, the stock on the shelves and the doormat trim are coral. That is
most of what makes three rooms of the same dimensions feel like three different
places, and it costs one field in the map data.

---

## Interiors

Three buildings open. Each got a room because it has a job that is genuinely
spatial: a room you walk into and out of with nothing in it is worse than a
door that stays shut.

| Room | Job | Colour |
| ---- | --- | ------ |
| Sunrise Minimart | The self checkout REWIND and BREAKSAFE both talk about, standing in it | Coral |
| Community post | The calm door to Safe, and the one place the world stops being playful | Blue |
| Corner kopitiam | The rewards counter, claimed from a person at a counter | Gold |

### They are 14 wide by 18 deep

Deeper than they are wide, because a phone held upright is.

This was measured rather than guessed. The rooms were first built 18 by 12, and
on a portrait phone that shape can only be shown two ways: crop it, or frame it
in a wide band of nothing. Filling the height of a 0.59 aspect viewport with a
12 tile deep room shows only about seven tiles across, whatever the room's
width is. Turning the room to face the same way as the screen fixed it, and a
shop with aisles running front to back is also just what a shop looks like.

### Surround

A room smaller than the viewport sits on a flat dark colour rather than on more
ground. That reads as a lit room in a dark building, and it is why the zoom is
capped: whatever is left over becomes an even dark frame. **A frame reads as
deliberate. Two thirds of the screen as background does not.**

### A machine is drawn as a machine

Nothing in this world may imply that an object has intentions, so the self
checkout is a box with a screen and the noticeboard is a panel on two legs.
Only people get faces. Giving a machine one would be the shortest possible
route to teaching that appearance predicts behaviour, and the whole district is
built the other way round.

The same rule holds in the dialogue: a fixture gets a glyph where a person
would get a portrait.

---

## Orientation

**Pick a scale, then let the viewport decide how much world fits.**

The camera never stretches a fixed rectangle into whatever shape the canvas is.
The scale comes from the shorter side of the container, so a person is the same
physical size on screen whichever way the phone is held, and turning it widens
the view rather than resizing anybody.

| Container | Result |
| --------- | ------ |
| Portrait phone | About 12 tiles across, 20 deep |
| Landscape phone | About 25 across, 12 deep |
| Desktop | About 28 across, 16 deep |

An earlier version held the visible *area* constant instead. That reads well
until the container gets very tall, at which point the height clamps, the width
collapses to compensate, and a portrait phone ends up looking through a nine
tile slot. Scale first is the version that survives both shapes.

### Controls follow the hands

| | Portrait | Landscape |
| - | -------- | --------- |
| World | In a box above the controls | Full bleed |
| Pad | Below the world, under the thumb | Left edge |
| Interact | Beside the pad | Right edge |
| Top bar | A real row | Floating, pointer-transparent except the controls |
| Middle of the screen | | **Never a control** |

Held upright the phone is a one-handed device and the controls belong under the
world, where they never cover it. Held sideways both thumbs are already at the
outer edges and the middle is dead space, which is exactly where the world
should be.

---

## The minimap

It answers one question: **what is out there and where am I in it.**

It deliberately does not answer *what should I do*, which is the Quest List's
job and is carried in words.

- Real terrain silhouette, not a grey rectangle with dots on it.
- Blocks drawn from their stated footprints, each with its own shopfront colour
  in the same place its sign is in the world.
- A gold dot on anybody with something available, the same colour as the spark
  above their head.
- The player last, white on a dark ring, so nothing can cover it.
- District only. An eighteen tile room does not need one.

Every marker it shows is also a row in the Quest List with text, so nothing is
map-only and nothing is colour-only. Its accessible name says where you are and
how many people have something for you.

---

## Quest markers end

A gold spark appears over anybody with something available. It means **there is
something here**, never *this person is suspicious*.

**Only things that can be finished get one.** Safe, the rewards counter and the
noticeboards have no done state, so a marker over them would never go out, and a
permanent alert is the definition of alarm fatigue.

---

## Customisation

Five axes, all free, all available from the start: skin, hair style, hair
colour, top, and one extra.

Where the option list grew, it grew towards the people the product is for.
Darker skin tones, more hair, and a covered head (`tudung`) are here because a
customiser that cannot make a recognisable share of Singapore youth is not
finished. Each is a silhouette, with no attempt at detail it cannot carry at
this size.

The extra is glasses, a cap, headphones or a bag. The bag is drawn for all four
facings, so somebody who picked it can still see it walking away.

**Nothing is earned, priced, dropped or bundled.** The moment a look has a cost,
the world acquires a reason to grind and the scenarios become the obstacle in
front of it.

---

## Prohibited, unchanged

- Sprite rips, tile packs of unverified provenance, asset-store maps.
- Any real map, address or property layout. District 01 is fictional.
- Retro parody, 8-bit meme aesthetics, deliberate ugliness as a joke.
- Dark cyberpunk Singapore. This is a youth neighbourhood in daylight.
- A crest, uniform, chevron, logo or wordmark from any real organisation.
- Anything childish enough to undercut what the district is actually about.
