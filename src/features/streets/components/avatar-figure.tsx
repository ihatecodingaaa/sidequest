import type { AvatarLook } from "@/features/streets/streets-data";

/**
 * The player, drawn at portrait scale.
 *
 * The same part layout the world sprite uses, so the person somebody sees on
 * Home and on You is exactly the person who walks around the district. That
 * correspondence is the whole point: a profile picture that differs from the
 * avatar is a picture, and this is meant to be them.
 *
 * Extracted from the Streets hero when the You page needed the same figure.
 * One drawing, three surfaces, and a change to the hair style shows up in all
 * of them.
 *
 * Decorative in every current use: each caller states who this is in real text
 * beside it, so there is no accessible name here to go stale.
 */
export function AvatarFigure({
  look,
  size = 58,
  className,
}: {
  look: AvatarLook;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 28"
      width={size}
      height={Math.round((size / 24) * 28)}
      aria-hidden
      className={className}
    >
      <ellipse cx="12" cy="25.5" rx="6" ry="1.8" fill="rgba(10,14,22,0.3)" />
      <rect x="9" y="18" width="2.6" height="7" fill="#2b3550" />
      <rect x="12.4" y="18" width="2.6" height="6" fill="#2b3550" />
      <rect x="8" y="11" width="8" height="7.4" fill={look.top} />
      <rect x="6.6" y="12" width="1.7" height="5" fill={look.skin} />
      <rect x="15.7" y="12" width="1.7" height="5" fill={look.skin} />
      <rect x="8.4" y="4" width="7.2" height="7.4" fill={look.skin} />
      {look.hairStyle === "swept" ? (
        <>
          <rect x="8" y="2.8" width="8" height="3" fill={look.hair} />
          <rect x="14.4" y="3.8" width="1.8" height="4" fill={look.hair} />
        </>
      ) : look.hairStyle === "tied" ? (
        <>
          <rect x="8" y="2.8" width="8" height="3" fill={look.hair} />
          <rect x="6.6" y="4.8" width="1.6" height="4" fill={look.hair} />
        </>
      ) : look.hairStyle === "curls" ? (
        <rect x="7.6" y="2.2" width="8.8" height="4" fill={look.hair} />
      ) : (
        <rect x="8" y="2.8" width="8" height="3.4" fill={look.hair} />
      )}
      <rect x="9.8" y="7.4" width="1.2" height="1.4" fill="#1a1208" />
      <rect x="13" y="7.4" width="1.2" height="1.4" fill="#1a1208" />
    </svg>
  );
}
