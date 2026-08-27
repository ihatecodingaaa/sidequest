# Landscape recovery

A P0 corrective pass driven by real device evidence: a rotated iPhone, where
the world collapsed and the controls took the screen.

Investigated 27 August 2026 against commit `aa6c6a8`, then revisited the
same day against `9c2d4e6` after a second round of real device testing.

---

## Observed failure

Reported from a real iPhone in Safari, with screenshots:

- Streets technically renders. HUD appears. Controls appear.
- The world collapses into a thin strip.
- Most of the usable landscape screen is empty dark area.
- Landscape gives **less** useful world visibility than portrait.
- The world reads as a banner rather than a game.

---

## Root cause

**Rotating the phone destroys the canvas and leaves the renderer drawing into a
detached element.** The world is not thin. It is dead.

### How it was found

Emulated landscape looked correct, which is why this was not caught earlier.
At 844x390 the layout resolves to `landscape`, the world occupies 100% of the
root, and the pad sits bottom left. Every iPhone landscape size tested the same
way passes. Measured across seven viewports:

| Case | Media query | Layout | World share |
| ---- | ----------- | ------ | ----------- |
| iPhone 13/14 landscape, 844x390 | true | landscape | 100% |
| iPhone Pro Max landscape, 932x430 | true | landscape | 100% |
| iPhone SE landscape, 667x375 | true | landscape | 100% |
| Landscape with tall chrome, 844x320 | true | landscape | 100% |
| iPad portrait, 820x1180 | false | portrait | 82% |
| iPad landscape, 1180x820 | **false** | **portrait** | **74%** |

So the static geometry is fine on a phone. The failure only appears when the
device is **rotated during a session**, which is exactly what a person does and
exactly what an emulated screenshot never does.

Rotating, then measuring:

| After | `data-player-tile` | `data-residents` | Animating | Centre pixel |
| ----- | ------------------ | ---------------- | --------- | ------------ |
| Load portrait | `20,11` | present | yes | painted |
| Walk | `20,9` | present | yes | painted |
| **Rotate to landscape** | **gone** | **gone** | **no** | **0,0,0,0** |

The canvas is transparent, publishes no attributes, and nothing moves.

### Why

`StreetsClient` rendered two different JSX trees:

```jsx
{landscape ? (
  <>{world}{topBar}{controls}</>
) : (
  <>{topBar}<div className="relative min-h-0 flex-1">{world}</div>{controls}</>
)}
```

React reconciles children by position. Slot 0 is the world fragment in one
branch and the top bar in the other; slot 1 is a bare `<div>` wrapper in one
and not in the other. The element types at every slot differ, so **React
unmounts the whole subtree and mounts a fresh one**, including a brand new
`<canvas>`.

`canvasRef.current` then points at the new node. `engineRef.current` still
holds an engine bound to the **old, detached** node, and the boot effect does
not re-run because its dependencies (`bridgeReady`, `needsAvatar`) did not
change. The render loop keeps running, drawing every frame into a canvas that
is no longer in the document.

The visible result is a blank world in the shape of whatever the new layout
gave it, with a working HUD and working controls on top, which is precisely
what the screenshots show.

### The iPad case is a second, smaller bug

`(orientation: landscape) and (max-height: 600px)` is false on an iPad in
landscape, so a tablet held sideways gets the **portrait** layout: world 74%,
falling further once browser chrome is subtracted. A media query that names a
device class is a guess about hardware. The layout should be a function of the
space it actually has.

---

## Rejected fixes

**Rebuild the engine on rotation.** Would work, and would throw away the
player's position, the camera, the resident positions and the frame budget
every time somebody turns their phone. Rotation is not a navigation event.

**Keep the two trees and re-point the engine at the new canvas.** Possible, and
it treats the symptom. The canvas would still be recreated, the terrain cache
would survive but the paint would flash, and the next person to add a
conditional wrapper would reintroduce it silently.

**Force an orientation lock.** Refused. Locking orientation is an
accessibility failure for anybody who cannot hold a device in one particular
way, and the manifest's `any` stays.

**Tune CSS values until the screenshot looks right.** This was the instinct the
brief explicitly warned against, and it would have produced a nicer looking
dead canvas.

---

## Chosen layout model

### 1. One tree, always

The root renders the **same three children in the same order with the same
element types** in both orientations. Only class names change. The canvas is
never unmounted, so the engine's reference to it can never go stale.

```
root  (fixed, measured height)
 |- top bar     relative in portrait, absolute top overlay in landscape
 |- world box   flex-1 in portrait, absolute inset-0 in landscape
 |- controls    relative in portrait, absolute bottom overlay in landscape
```

Stacking is explicit (`z-0` world, `z-20` chrome) rather than implicit in DOM
order, because in overlay mode the world comes after the bar in the document.

### 2. The orientation decision is measured, not queried

A `ResizeObserver` on the root reports real numbers, and the rule is a pure
aspect test:

> **Overlay when width divided by height is at least 1.25.**

No media query, no device class, no height threshold. A landscape phone is
about 2.2. A portrait phone is about 0.46. A portrait tablet is 0.7 and stays
stacked. A landscape tablet is 1.4 and now correctly gets the overlay layout
that its shape wants.

### 3. The world is the screen; controls float

In landscape the world fills the visual viewport and the chrome sits on top of
it at the edges, translucent, with the middle of the screen kept clear. Target:
the world owns effectively all of the usable height, with controls overlapping
rather than displacing it.

### 4. Height comes from the browser, not from JavaScript

`position: fixed; inset: 0` sizes to the layout viewport, which on iOS Safari
is taller than what the person can see, so anything anchored to the bottom
hides under the browser chrome.

The first version of this fix read `window.visualViewport.height` and set the
root's height from it. **That was wrong, and the second real-Safari failure
below is what it caused.** The root now uses `h-[100dvh]`: the dynamic viewport
already excludes browser chrome, the browser keeps it correct, and unlike a
value read from an event it cannot be left stale by a rotation.

---

## Test matrix

Geometry is asserted rather than eyeballed, so the thin-strip regression cannot
come back quietly.

| Viewport | Expect |
| -------- | ------ |
| 390x844, 393x852, 430x932 | Stacked. World at least 55% of the root. |
| 844x390, 852x393, 932x430 | Overlay. World at least 90% of the root. Pad in the lower left quadrant, interact in the lower right. |
| 844x320 (tall chrome) | Overlay, controls still inside the root. |
| 820x1180 | Stacked. |
| 1180x820 | **Overlay**, which the old media query got wrong. |
| 1440x900 | Overlay. |

Plus behavioural rotation coverage: portrait to landscape and back, while
standing, walking, next to somebody, inside a building, and with the Quest List
open. After every rotation the canvas must still be publishing tiles, residents
must still be moving, and the player must not have moved.

---

# Second real-Safari failure

Found on hardware after the fix above shipped. The catastrophic bug was gone,
and a quieter one was underneath it.

## Observed

On a real iPhone:

1. Portrait looks correct.
2. Rotate to landscape. The world renders and is playable.
3. Rotate back to portrait. **Portrait stays visually compressed**, using the
   landscape geometry.
4. Refreshing the browser recovers it.

That last line is the diagnosis in one sentence. Refresh fixing something means
a value that was correct at load has since gone stale, and nothing corrects it.

## Root cause

`root.style.height` was set from `visualViewport.height` in JavaScript, and it
was the **only** geometry value in the system that JavaScript owned. Everything
downstream came from it: the observed box, the layout mode, the camera scale,
the canvas buffer.

Two things made it stale.

**`orientationchange` fires before the viewport settles on iOS.** The handler
read `visualViewport.height` synchronously inside that event, which returns the
pre-rotation height, and committed it.

**An event value has no self-correction.** If the later `visualViewport.resize`
that would have fixed it never arrives, or arrives with an intermediate value
while Safari is still animating its toolbar, the stale number simply stays.
The root keeps the landscape height in portrait, and every geometry derived
from it is squeezed to match.

Instrumented in Chromium across five transitions for comparison: `styleH`
tracked `visualViewport.height` exactly at every step, and the post-rotation
state was identical to the post-refresh state. Chromium does not reproduce it,
which is the point. Chromium is what missed both of these.

## Why refresh fixed it

The first read on load happens after the viewport has settled, so it is always
correct. Refreshing was not repairing anything. It was taking a fresh correct
measurement in place of a stale one.

## Chosen fix

**The height is CSS again.** `h-[100dvh]` on the root. The dynamic viewport
already excludes browser chrome, the browser keeps it correct, and it cannot be
stale because nothing is holding a copy of it.

JavaScript now only ever **observes the result**, which is the direction that
cannot drift:

- One `ResizeObserver` on the world container produces one `ViewportMetrics`
  object, and the layout mode, the compact tier and the engine's own resize all
  read that same object. There used to be two independent paths here, and the
  camera could be sized from one moment while the HUD was sized from another.
- A `ResizeObserver` is **self-correcting**: an intermediate size during a
  rotation is followed by the settled one, because both are box changes. That
  is the property the event listener did not have, and it is why there is no
  timer anywhere in the fix.
- `visualViewport.resize` and `orientationchange` are still subscribed to, but
  only as **extra triggers to re-measure the element**, never as sources of
  truth. Safari can settle its toolbar after the last box change, and this
  catches that without introducing a number that can disagree with the box.

## Rejected fixes

**A refresh, a reload, or a forced remount.** Explicitly out. Requiring a
refresh to recover a layout is the bug, not a workaround for it.

**A `setTimeout` after rotation.** Every value in the range is either too short
on a slow device or a visible pause on a fast one, and it would have hidden the
fact that the real problem was a value that could not correct itself.

**More listeners on the same stale read.** Piling `resize`, `pageshow` and
`focus` onto a handler that reads `visualViewport.height` would raise the odds
of catching the settled value without ever removing the possibility of missing
it.

**Double `requestAnimationFrame` settling.** Considered, and unnecessary once
the height stopped being a JavaScript value. It would have been machinery to
work around a design rather than a fix for it.

## Acceptance

Measured at 375x667, an iPhone SE, which is the smallest case:

| | Layout |
| - | ------ |
| Fresh portrait | `portrait/false root 375x667 world 375x469 buf 750x939` |
| After portrait to landscape to portrait | **identical** |
| After a refresh on top of that | **identical** |

Refresh makes no difference because there is nothing left for it to fix. A test
asserts all three strings are equal.

---

## Remaining physical-device risks

Honestly stated, because emulation is what missed this in the first place.

1. **iOS Safari `visualViewport` resize timing.** Safari fires resize during
   the rotation animation as well as after it. The engine reframes on each,
   which is cheap, but a device could show one frame at an intermediate size.
2. **Dynamic Island and home indicator in landscape.** Safe area insets are
   respected on all four edges, but the exact left and right insets on a
   notched device in landscape have not been observed on hardware.
3. **The 1.25 aspect threshold near the boundary.** A folding device or a
   split-view pane close to square will flip between layouts. Nothing breaks,
   but it will look indecisive.
4. **Chromium is not Safari.** Every measurement in this document was taken in
   Chromium, and Chromium has now missed two real defects in a row. A WebKit
   project exists for the three specs where the engine and the browser meet,
   opt in with `SQ_WEBKIT=1`, because the WebKit binary cannot launch on the
   development machine: it reports `libxslt.dll` missing, and
   `npx playwright install-deps webkit` is a no-op on Windows. On a machine
   that can run it, `SQ_WEBKIT=1 npx playwright test` adds 57 WebKit tests.
5. **The compact tier boundary.** Landscape under 480 CSS pixels tall switches
   to the compact HUD. Chosen because every iPhone in landscape is at most 430
   tall and the smallest tablet in landscape is 744, but it has not been seen
   on a device where Safari's chrome puts the height near the line.

**The next action after this pass is real iPhone testing.** Rotation during
play is the specific thing to try first.
