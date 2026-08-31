/**
 * Scenes a hotspot step can be drawn on.
 *
 * ---
 *
 * ## The job
 *
 * `docs/VISUAL_ART_DIRECTION.md` enumerates the jobs a visual is allowed to
 * have, and this one holds two of them: it establishes a setting, and it shows
 * the object a decision is about. A hotspot step without a picture would be a
 * list of five sentences, which is the thing this pass exists to stop.
 *
 * ## The rules it follows
 *
 * Original SVG drawn in code, flat fills, no gradient inside the illustration,
 * generous corner radii, strokes that survive phone scale. It is an elevation
 * rather than a perspective view because a flat elevation puts every hotspot
 * at an unambiguous position, which matters when a 44px target sits on top of
 * each one.
 *
 * **Nobody is drawn.** There is no figure in this scene and there is not going
 * to be one. A hotspot mechanic invites tapping whatever is in the picture, and
 * a product about crime prevention that puts a person in a scene captioned
 * "tap what is making the wrong thing easy" has taught something it spends the
 * rest of its content unteaching. The shop is the subject.
 *
 * The artwork is `aria-hidden` where it is used: `HotspotScene` puts the
 * accessible names on the buttons, so nothing here is the only carrier of
 * anything.
 */

export type SceneId = "minimart-floor";

export function SceneArt({ id }: { id: SceneId }) {
  if (id === "minimart-floor") return <MinimartFloor />;
  return null;
}

/**
 * Sunrise Minimart, from the front.
 *
 * Read left to right: the poster by the door, the counter with a promotional
 * stack parked in front of it, the aisles, and the self checkout bank on the
 * right with a camera above the middle of the room. The stack is deliberately
 * tall enough to break the line between the counter and the last aisle,
 * because that is the finding the scene has to make visible before the text
 * explains it.
 */
function MinimartFloor() {
  return (
    <svg
      viewBox="0 0 160 120"
      className="size-full"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
    >
      {/* Room */}
      <rect width="160" height="120" fill="#141920" />
      <rect x="0" y="86" width="160" height="34" fill="#1b212a" />
      <line x1="0" y1="86" x2="160" y2="86" stroke="#2a323d" strokeWidth="1.4" />

      {/* Ceiling strip lights. Flat, not glowing: no gradients in artwork. */}
      <rect x="14" y="6" width="34" height="3" rx="1.5" fill="#2f3947" />
      <rect x="63" y="6" width="34" height="3" rx="1.5" fill="#2f3947" />
      <rect x="112" y="6" width="34" height="3" rx="1.5" fill="#2f3947" />

      {/* Camera, dome on a short stalk, above the middle of the floor */}
      <line x1="83" y1="9" x2="83" y2="14" stroke="#4a5563" strokeWidth="1.8" />
      <path d="M76 20a7 7 0 0 1 14 0z" fill="#39434f" />
      <circle cx="83" cy="19" r="2.2" fill="#6d7a8b" />

      {/* Poster by the door, top left */}
      <rect x="18" y="18" width="26" height="18" rx="2" fill="#22313f" stroke="#3b4c5e" strokeWidth="1.4" />
      <rect x="22" y="23" width="18" height="2" rx="1" fill="#5d7a94" />
      <rect x="22" y="28" width="13" height="2" rx="1" fill="#4a5c6e" />

      {/* Counter, left of centre */}
      <rect x="40" y="52" width="46" height="34" rx="3" fill="#2a2016" stroke="#4a3a24" strokeWidth="1.6" />
      <rect x="44" y="44" width="38" height="9" rx="2" fill="#372a1c" />

      {/* The promotional stack, parked in front of the counter */}
      <rect x="52" y="40" width="22" height="46" rx="3" fill="#3a2a2a" stroke="#5e3f3f" strokeWidth="1.6" />
      <line x1="52" y1="55" x2="74" y2="55" stroke="#5e3f3f" strokeWidth="1.4" />
      <line x1="52" y1="70" x2="74" y2="70" stroke="#5e3f3f" strokeWidth="1.4" />

      {/* Aisles */}
      <g fill="#232c36" stroke="#333f4d" strokeWidth="1.4">
        <rect x="6" y="52" width="26" height="34" rx="3" />
        <rect x="94" y="66" width="24" height="20" rx="3" />
      </g>
      <g stroke="#333f4d" strokeWidth="1.2">
        <line x1="6" y1="64" x2="32" y2="64" />
        <line x1="6" y1="75" x2="32" y2="75" />
        <line x1="94" y1="76" x2="118" y2="76" />
      </g>

      {/* Self checkout bank, right */}
      <g>
        <rect x="108" y="60" width="20" height="26" rx="3" fill="#232c36" stroke="#3a4756" strokeWidth="1.6" />
        <rect x="132" y="60" width="20" height="26" rx="3" fill="#232c36" stroke="#3a4756" strokeWidth="1.6" />
        {/* Screens. Two grey words, which is the finding. */}
        <rect x="111" y="42" width="14" height="16" rx="2" fill="#1a222c" stroke="#3a4756" strokeWidth="1.4" />
        <rect x="135" y="42" width="14" height="16" rx="2" fill="#1a222c" stroke="#3a4756" strokeWidth="1.4" />
        <rect x="114" y="48" width="8" height="1.6" rx="0.8" fill="#48586a" />
        <rect x="138" y="48" width="8" height="1.6" rx="0.8" fill="#48586a" />
        {/* Bagging trays */}
        <rect x="110" y="88" width="16" height="4" rx="2" fill="#2c3743" />
        <rect x="134" y="88" width="16" height="4" rx="2" fill="#2c3743" />
      </g>
    </svg>
  );
}
