/**
 * Accent tokens map to literal Tailwind class strings.
 * Tailwind scans source text, so these must never be built by concatenation.
 */

export type Accent = "quest" | "pulse" | "volt" | "coral" | "gold";

export const ACCENT_TEXT: Record<Accent, string> = {
  quest: "text-quest-300",
  pulse: "text-pulse-300",
  volt: "text-volt-300",
  coral: "text-coral-300",
  gold: "text-gold-400",
};

export const ACCENT_BG_SOFT: Record<Accent, string> = {
  quest: "bg-quest-500/12",
  pulse: "bg-pulse-500/12",
  volt: "bg-volt-500/12",
  coral: "bg-coral-500/12",
  gold: "bg-gold-500/12",
};

export const ACCENT_BORDER: Record<Accent, string> = {
  quest: "border-quest-500/30",
  pulse: "border-pulse-500/30",
  volt: "border-volt-500/30",
  coral: "border-coral-500/30",
  gold: "border-gold-500/30",
};

export const ACCENT_SOLID: Record<Accent, string> = {
  quest: "bg-quest-500",
  pulse: "bg-pulse-500",
  volt: "bg-volt-500",
  coral: "bg-coral-500",
  gold: "bg-gold-500",
};

export const ACCENT_ON_SOLID: Record<Accent, string> = {
  quest: "text-white",
  pulse: "text-ink-900",
  volt: "text-ink-900",
  coral: "text-ink-900",
  gold: "text-ink-900",
};

export const ACCENT_GLOW: Record<Accent, string> = {
  quest: "shadow-[0_0_36px_-8px_rgba(110,86,248,0.55)]",
  pulse: "shadow-[0_0_36px_-8px_rgba(34,205,230,0.5)]",
  volt: "shadow-[0_0_36px_-8px_rgba(180,255,61,0.45)]",
  coral: "shadow-[0_0_36px_-8px_rgba(255,95,95,0.5)]",
  gold: "shadow-[0_0_36px_-8px_rgba(255,201,77,0.5)]",
};

export const ACCENT_RING: Record<Accent, string> = {
  quest: "ring-quest-500/40",
  pulse: "ring-pulse-500/40",
  volt: "ring-volt-500/40",
  coral: "ring-coral-500/40",
  gold: "ring-gold-500/40",
};

export const ACCENT_GRADIENT: Record<Accent, string> = {
  quest: "from-quest-500 to-quest-400",
  pulse: "from-pulse-500 to-pulse-400",
  volt: "from-volt-600 to-volt-400",
  coral: "from-coral-500 to-coral-400",
  gold: "from-gold-600 to-gold-400",
};
