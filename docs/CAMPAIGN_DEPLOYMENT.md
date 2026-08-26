# Running a Campaign at a real event

Practical notes for a school activation, a roadshow, or a community session.

## What you need

| Item | Quantity | Notes |
| ---- | -------- | ----- |
| Printed station signs | 4 minimum, 6 to 8 better | A4 or A3. From `/campaigns/one-bad-minute/stations` |
| Physical stations | 4 | A table, a wall, a pillar. Anything a sign can be attached to |
| Facilitators | 1 to 2 | Not one per station. See below |
| Wifi or mobile data | Helpful, not critical | The app is a PWA and the chapters are bundled |
| Space | Enough to spread 4 stations apart | The distance is the point |

There is no app to install, no login, no account and no setup on anybody's
phone. A participant needs a phone with a camera and nothing else.

## Before the event

1. Open `/campaigns/one-bad-minute/stations` **from the address participants
   will actually use**. The QR codes are generated from that address, so
   printing them from a laptop on `localhost` produces signs that only work on
   that laptop.
2. Print one sign per station. Print **two or three copies** of whichever
   stations you expect to be busiest and put them a few metres apart. The same
   QR can appear on as many signs as you like: it is an ordinary URL, and
   nothing tracks how many copies exist.
3. Check each printed code with your own phone camera, from about a metre away,
   under the lighting the event will actually have.
4. Note the four station codes: **A7, B4, C9, D2**. A facilitator should be able
   to read these out without looking them up.

## Placing the stations

Spread them out. The single biggest cause of a roadshow queue is two popular
things next to each other.

- Put the four stations in different parts of the space, not in a row.
- Leave standing room **beside** each station, not in front of it. People need
  somewhere to step aside to.
- Do not put a station in a corridor or a doorway.
- Height matters more than size: a sign at chest height scans faster than a
  large one on a table.

## How the congestion design works

Five mechanisms, all already built:

**Parallel routes.** Each phone is assigned one of four routes, each starting at
a different station. With any reasonable number of participants this spreads
arrivals roughly evenly without a server deciding anything.

**Scan and Scatter.** The first thing on screen after a scan is an instruction
to walk away from the station. The chapter is saved to the phone and does not
need the QR again. This is the mechanism that matters most: a station is
occupied for the two seconds a scan takes, not for the four minutes a chapter
takes.

**Short chapters.** Each chapter is roughly 60 to 150 seconds of interaction
after the scan, and is designed to be playable standing up.

**Three of four.** The finale opens after any three chapters. A busy station is
something to skip, not something to wait at.

**Duplicate signs.** Printing the same QR twice halves that station's queue and
costs one sheet of paper.

## Facilitators

You do not need one person per station. One or two people circulating is
better, and their job is mostly:

- Reading out a station code when somebody cannot scan.
- Telling people they can do the stations in any order.
- Telling people three of four is enough.
- Encouraging groups of two to four to do the Crew Shift station together.

Nothing requires a facilitator to operate a device or manage a queue.

## When something breaks

| Problem | What to do |
| ------- | ---------- |
| A sign is torn or gone | Read out the station code. Every chapter is reachable by code |
| A camera will not focus | Station code. The entry field is permanently on the Campaign screen |
| A phone has no camera permission | Station code |
| A whole station is unusable | Nothing. Three of four still opens the finale |
| Wifi drops | Chapters already open keep working. A first scan needs a connection |
| Somebody arrives late | They start wherever they are. Order does not matter |
| Somebody is alone at Crew Shift | Solo mode is supported and the screen says so |
| A phone dies | Progress is per-device and will be lost. Say so up front if it matters |

The one genuine single point of failure is the first page load: a phone with no
connection at all cannot open a chapter it has never seen. Venue wifi, a
hotspot, or simply mobile data covers this.

## Timing

| Segment | Duration |
| ------- | -------- |
| One chapter, scan to finish | 2 to 5 minutes |
| Three chapters plus finale | 12 to 15 minutes |
| All four plus finale | 16 to 20 minutes |

For a class-sized group of about 30, budget 25 minutes including the walking
about. For a drop-in roadshow, there is no session length: people arrive, scan,
and leave when they leave.

## Throughput

A rough model, for planning rather than promising.

With four stations, an average scan occupying a station for about 10 seconds,
and Scan and Scatter working as intended, each station can process roughly 6
participants a minute. Four stations is therefore around 24 scans a minute at
the theoretical limit, and realistically far fewer because people talk, read the
sign, and take photos.

The practical constraint is not the stations, it is the space to stand in
afterwards. Plan for room, not for throughput.

## After the event

Tell participants that the story continues. This is the part that separates a
Campaign from a booth, and it is worth saying out loud:

> The next chapter opens tomorrow, and another one a week later. You do not have
> to be here for them.

Follow-ups unlock on the participant's own device, timed from when they finished
the finale. There is no notification infrastructure in this build, so the honest
version of the pitch is that the chapters are waiting when they next open the
app, not that their phone will buzz.

## What a real deployment would need that this build does not have

Being straight about it:

- **Accounts.** Progress is per-browser. Clearing site data or switching phones
  loses it.
- **Notifications.** Follow-ups unlock, but nothing tells the participant.
- **Organiser tooling.** Station signs are the whole of it. There is no
  attendance view, no live dashboard and no content editor.
- **Agreement with the venue.** The prototype names a location for illustration
  only. A real deployment runs with the venue's consent.

None of these are needed to run the experience. All of them would be needed to
run it twice.
