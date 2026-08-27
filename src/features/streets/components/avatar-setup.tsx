"use client";

import { useState } from "react";
import { Shuffle } from "lucide-react";

import { cn } from "@/lib/cn";
import {
  ACCESSORIES,
  DEFAULT_AVATAR,
  HAIR_COLOURS,
  HAIR_STYLES,
  SKIN_TONES,
  TOP_COLOURS,
  type AvatarLook,
} from "@/features/streets/streets-data";

/**
 * Avatar setup, deliberately small.
 *
 * Birk et al. (CHI 2016) tie the motivational effect to *identification*, not
 * to the number of options, so this is five axes with small sets rather than a
 * character creator. It stays small for a concrete reason too: every option has
 * to work in four walking directions, and the combinations are already in the
 * tens of thousands. Nothing is pre-rendered: the sprite is layered at draw
 * time, which is what keeps the option list free.
 *
 * Where it did grow, it grew towards the people it is for. Darker skin tones,
 * more hair, and a covered head are all here because a customiser that cannot
 * make a recognisable share of Singapore youth is not finished. Everything is
 * available from the start: nothing is earned, priced, dropped or bundled.
 *
 * Nothing is labelled by gender. Randomise and Skip are both first-class, so
 * nobody who does not care has to care. Target is under thirty seconds.
 *
 * The avatar is fictional and local. No photograph, no camera, no account.
 */
export function AvatarSetup({
  onDone,
  onSkip,
}: {
  onDone: (look: AvatarLook) => void;
  onSkip: () => void;
}) {
  const [look, setLook] = useState<AvatarLook>(DEFAULT_AVATAR);

  const randomise = () =>
    setLook({
      skin: pick(SKIN_TONES),
      hair: pick(HAIR_COLOURS),
      hairStyle: pick(HAIR_STYLES),
      top: pick(TOP_COLOURS),
      accessory: pick(ACCESSORIES),
    });

  return (
    <div className="fixed inset-0 z-40 flex flex-col bg-ink-900 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <h1 className="font-display text-2xl font-extrabold tracking-tight text-chalk">
        Who are you today?
      </h1>
      <p className="mt-1 text-sm text-muted">Change it whenever. It is only how you look.</p>

      {/* The sprite, at the size it appears in the world, x4. */}
      <div className="my-6 grid place-items-center rounded-3xl border border-white/10 bg-[#3f7a46] py-7">
        <AvatarPreview look={look} />
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
        <Row label="Skin">
          {SKIN_TONES.map((tone) => (
            <Swatch
              key={tone}
              colour={tone}
              selected={look.skin === tone}
              label={`Skin tone`}
              onSelect={() => setLook({ ...look, skin: tone })}
            />
          ))}
        </Row>

        <Row label="Hair">
          {HAIR_STYLES.map((style) => (
            <button
              key={style}
              type="button"
              aria-pressed={look.hairStyle === style}
              onClick={() => setLook({ ...look, hairStyle: style })}
              className={cn(
                "sq-pressable min-h-11 rounded-xl border px-3.5 text-sm font-semibold capitalize",
                look.hairStyle === style
                  ? "border-quest-400 bg-quest-500/15 text-chalk"
                  : "border-white/12 text-mist",
              )}
            >
              {style}
            </button>
          ))}
        </Row>

        <Row label="Hair colour">
          {HAIR_COLOURS.map((colour) => (
            <Swatch
              key={colour}
              colour={colour}
              selected={look.hair === colour}
              label="Hair colour"
              onSelect={() => setLook({ ...look, hair: colour })}
            />
          ))}
        </Row>

        <Row label="Top">
          {TOP_COLOURS.map((colour) => (
            <Swatch
              key={colour}
              colour={colour}
              selected={look.top === colour}
              label="Top colour"
              onSelect={() => setLook({ ...look, top: colour })}
            />
          ))}
        </Row>

        <Row label="One extra">
          {ACCESSORIES.map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={(look.accessory ?? "none") === item}
              onClick={() => setLook({ ...look, accessory: item })}
              className={cn(
                "sq-pressable min-h-11 rounded-xl border px-3.5 text-sm font-semibold capitalize",
                (look.accessory ?? "none") === item
                  ? "border-quest-400 bg-quest-500/15 text-chalk"
                  : "border-white/12 text-mist",
              )}
            >
              {item}
            </button>
          ))}
        </Row>
      </div>

      <div className="mt-5 space-y-2.5">
        <button
          type="button"
          onClick={() => onDone(look)}
          className="sq-pressable flex min-h-13 w-full items-center justify-center rounded-2xl bg-volt-500 py-3.5 text-sm font-bold text-ink-900"
        >
          Head out
        </button>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={randomise}
            className="sq-pressable flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/12 text-sm font-semibold text-mist"
          >
            <Shuffle aria-hidden className="size-4" />
            Randomise
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="sq-pressable flex min-h-12 flex-1 items-center justify-center rounded-2xl text-sm font-semibold text-muted hover:text-chalk"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-faint">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Swatch({
  colour,
  selected,
  label,
  onSelect,
}: {
  colour: string;
  selected: boolean;
  label: string;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`${label} ${colour}`}
      onClick={onSelect}
      style={{ background: colour }}
      className={cn(
        "sq-pressable size-11 rounded-full border-2 transition-transform",
        selected ? "border-chalk scale-110" : "border-white/15",
      )}
    />
  );
}

/**
 * The avatar as it actually appears, drawn with the same part layout as the
 * world sprite. The point of showing it here is that customisation which only
 * works in a portrait is a lie: what somebody picks has to be what they walk
 * around as.
 */
function AvatarPreview({ look }: { look: AvatarLook }) {
  return (
    <svg viewBox="0 0 24 28" width={120} height={140} aria-label="Your character" role="img">
      <ellipse cx="12" cy="25.5" rx="6" ry="1.8" fill="rgba(10,14,22,0.28)" />
      <rect x="9" y="18" width="2.6" height="7" fill="#2b3550" />
      <rect x="12.4" y="18" width="2.6" height="7" fill="#2b3550" />
      <rect x="8" y="11" width="8" height="7.4" fill={look.top} />
      <rect x="6.6" y="12" width="1.7" height="5" fill={look.skin} />
      <rect x="15.7" y="12" width="1.7" height="5" fill={look.skin} />
      <rect x="8.4" y="4" width="7.2" height="7.4" fill={look.skin} />
      <Hair style={look.hairStyle} colour={look.hair} />
      <rect x="9.8" y="7.4" width="1.2" height="1.4" fill="#1a1208" />
      <rect x="13" y="7.4" width="1.2" height="1.4" fill="#1a1208" />
      <Extra accessory={look.accessory} />
    </svg>
  );
}

/** The same silhouettes the renderer draws, at the same proportions. */
function Hair({ style, colour }: { style: AvatarLook["hairStyle"]; colour: string }) {
  switch (style) {
    case "swept":
      return (
        <>
          <rect x="8" y="2.8" width="8" height="3" fill={colour} />
          <rect x="14.4" y="3.8" width="1.8" height="4" fill={colour} />
        </>
      );
    case "tied":
      return (
        <>
          <rect x="8" y="2.8" width="8" height="3" fill={colour} />
          <rect x="6.6" y="4.8" width="1.6" height="4" fill={colour} />
        </>
      );
    case "curls":
      return <rect x="7.6" y="2.2" width="8.8" height="4" fill={colour} />;
    case "buzz":
      return <rect x="8.4" y="3.4" width="7.2" height="2.2" fill={colour} />;
    case "long":
      return (
        <>
          <rect x="8" y="3" width="8" height="3" fill={colour} />
          <rect x="7.4" y="4" width="1.6" height="8" fill={colour} />
          <rect x="15" y="4" width="1.6" height="8" fill={colour} />
        </>
      );
    case "tudung":
      return (
        <>
          <rect x="7.6" y="2.6" width="8.8" height="5" fill={colour} />
          <rect x="7.6" y="7" width="1.6" height="6" fill={colour} />
          <rect x="14.8" y="7" width="1.6" height="6" fill={colour} />
          <rect x="8.6" y="12" width="6.8" height="2.4" fill={colour} />
        </>
      );
    default:
      return <rect x="8" y="2.8" width="8" height="3.4" fill={colour} />;
  }
}

/** The one extra, drawn over the head or the torso as the case may be. */
function Extra({ accessory }: { accessory: AvatarLook["accessory"] }) {
  switch (accessory) {
    case "glasses":
      return (
        <>
          <rect x="9" y="6.4" width="2.4" height="2" fill="rgba(24,28,40,0.85)" />
          <rect x="12.6" y="6.4" width="2.4" height="2" fill="rgba(24,28,40,0.85)" />
          <rect x="11.4" y="7" width="1.2" height="0.8" fill="rgba(24,28,40,0.85)" />
        </>
      );
    case "cap":
      return (
        <>
          <rect x="7.8" y="2.2" width="8.4" height="3" fill="#22303f" />
          <rect x="7.4" y="4.8" width="9.2" height="1.6" fill="#2f4258" />
        </>
      );
    case "headphones":
      return (
        <>
          <rect x="7.2" y="2" width="9.6" height="1.6" fill="#1c2230" />
          <rect x="6.6" y="3.6" width="1.8" height="3.4" fill="#1c2230" />
          <rect x="15.6" y="3.6" width="1.8" height="3.4" fill="#1c2230" />
        </>
      );
    case "bag":
      return (
        <>
          <rect x="7" y="11.6" width="1.8" height="5.2" fill="#3a4560" />
          <rect x="15.2" y="11.6" width="1.8" height="5.2" fill="#3a4560" />
        </>
      );
    default:
      return null;
  }
}

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)] as T;
}
