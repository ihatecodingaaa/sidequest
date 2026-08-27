# Landscape recovery

A P0 corrective pass driven by real device evidence: a rotated iPhone, where
the world collapsed and the controls took the screen.

Investigated 27 August 2026 against commit `aa6c6a8`.

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

### 4. Height comes from the visual viewport where the browser offers one

`position: fixed; inset: 0` sizes to the layout viewport, which on iOS Safari
is taller than what the person can see. The root now takes its height from
`window.visualViewport.height` when that API exists, falling back to `100dvh`
and then to `100vh`. That keeps the interact button and the pad above the home
indicator and out from under the browser chrome.

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
   Chromium. The bug it found is a React reconciliation bug and is not
   engine-specific, but the layout numbers should still be confirmed on
   hardware.

**The next action after this pass is real iPhone testing.** Rotation during
play is the specific thing to try first.
