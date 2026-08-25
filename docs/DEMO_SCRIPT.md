# Demo script

Target: three to four minutes. Practise it twice before judging.

## Before you start

1. Open the deployed URL (or `npm run start` locally) on a phone-width window.
2. Go to **Settings** and tap **Reset demo**. You should land on onboarding.
3. Put the phone or browser on **Do Not Disturb**. A notification banner over
   the bottom nav during a demo is avoidable.
4. Have `/?demo=reset` ready to paste as a one-tap reset between judges.

The whole app is offline-capable once loaded, but the outbound links (CNA,
ScamShield, police.gov.sg, meLISTEN) need a connection. If the venue wifi is
bad, do not tap them; describe them instead. Nothing else in the demo depends
on the network.

---

## Moment 1: onboarding, 20 seconds

Run through onboarding live. It is four short steps and it makes the age
adaptation visible without a slide.

> "Four questions. Age band, interests, area. All of it stays on the device,
> and none of it is required."

Pick **16 to 18**, keep the default interests, pick **Tampines**.

## Moment 2: Home, 30 seconds

Home loads with the Safety Pulse, the three signature missions, a two minute
quest, a Field Quest near you, your crew, radio and a reward.

> "This is the whole product in one screen. Most prevention information ends
> when someone closes it. Watch what happens here instead."

Point at the level card.

> "Progress tracks what you can do, not how much you have read."

## Moment 3: information to action, 45 seconds

Tap the Safety Pulse hero: **Job offers that pay too well, land too fast**.

Point out the **Prototype content** label.

> "Everything seeded in this build is labelled. We never dress up our own
> writing as a live feed, and we never republish anyone's article."

Tap **Try the related quest**.

> "That is the whole thesis. The advisory does not end. It becomes the
> decision."

Tap **Start mission** and play two or three beats of **$400 a day, work from
home**. Choose *Keep going, it is paying*, then *Stop here and leave the group*.

Read one takeaway aloud, then finish the mission.

> "Sixty XP, and it also builds Scam Awareness and Decision Making in the
> Safety Passport."

## Moment 4: BREAKSAFE, 60 seconds

This is the moment. Go to **Missions**, then **Start here**, then **BREAKSAFE**.

> "Crime prevention as engineering. The question is not who is likely to steal.
> It is what makes the honest thing hard."

Tap **Open the terminal**. Hand the phone to the judge if you can.

Tap the **scan area** hotspot.

> "You cannot tell whether the item scanned."

Tap **the shopper** hotspot.

> "That one is a decoy. The person is never the thing to solve."

Find one more, then tap **Now change something**.

Let the judge choose. If they pick facial recognition, let them, and read the
verdict out: it scores 1 out of 5 on privacy and fairness for a reason. If they
pick the good ones, take **Make the scan unmistakable** and **No-fault rescan**.

Tap **Rebuild the terminal**. Let the before and after sit for a second.

> "Same person. Same product. Different environment. We changed the
> environment, not the person, and we did it without identifying anybody."

Finish the mission.

## Moment 5: Partner Challenge, 30 seconds

Missions, then **Make self-checkout safer**.

> "This is where playing prevention turns into designing it. A partner sets a
> brief, with real constraints, and young people answer it."

Point at the label.

> "Prototype Partner Challenge. Nobody commissioned this. We wrote it to show
> the format, and we say so on the screen."

If time allows, open **Partner studio** at `/partner` for ten seconds to show
that the mission formats are templates an organisation could author themselves.

## Moment 6: Safety Passport and rewards, 30 seconds

Tap **You**.

> "Seven capability areas. Not badges. What this person can actually do, which
> is the thing a school or a partner would want to read."

Tap **Rewards**.

> "Recognition is cheapest, vouchers are most expensive. That ordering is
> deliberate: if the fastest route to a voucher is clicking through content,
> the whole thing becomes a farm. Everything commercial here is a concept, and
> the prototype issues no code and no monetary value."

## Moment 7: Safe, 20 seconds

Tap **Safe**.

> "The last thing we would ever do is rebuild these. SIDEQUEST does not take
> crime reports, does not store incident information, and does not rank
> neighbourhoods. It hands you to the people whose job it is."

Scroll to **What SIDEQUEST deliberately does not do**.

## Moment 8: close, 15 seconds

> "We are not building another place for youths to learn about crime
> prevention. We are building a reason for them to participate in it."

---

## Recovery

| If this fails                | Do this                                                                   |
| ---------------------------- | ------------------------------------------------------------------------- |
| No internet                  | Everything except outbound links still works. Describe the links.          |
| Camera permission denied     | The Field Quest code field is always on screen. Type `SQ-TAMPINES`.        |
| Geolocation denied           | Nothing breaks. Area is picked manually in onboarding and Settings.        |
| An external link 404s        | The Pulse card and the mission still work. Move on.                        |
| State looks wrong or stuck   | Settings, Reset demo. Or open `/?demo=reset`.                              |
| You need a populated profile | Settings, Load demo progress. Or open `/?demo=1`.                          |
| A judge wants to explore     | Hand it over. Every route is reachable and nothing can be broken from the UI. |
| Phone dies                   | The same URL runs on a laptop with a proper desktop layout.                |

## Between judges

`/?demo=reset` then hand it over. Two seconds.
