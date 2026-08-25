/**
 * Formatting helpers. Everything is deterministic against a supplied "now" so
 * demo mode never shows a timestamp drifting mid-presentation.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function relativeTime(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const delta = now.getTime() - then;

  if (delta < 0) return "Scheduled";
  if (delta < MINUTE) return "Just now";
  if (delta < HOUR) return `${Math.floor(delta / MINUTE)}m ago`;
  if (delta < DAY) return `${Math.floor(delta / HOUR)}h ago`;
  if (delta < 7 * DAY) return `${Math.floor(delta / DAY)}d ago`;

  return new Date(iso).toLocaleDateString("en-SG", { day: "numeric", month: "short" });
}

export function formatXp(xp: number): string {
  return xp.toLocaleString("en-SG");
}

export function greetingFor(date: Date = new Date()): string {
  const hour = date.getHours();
  if (hour < 5) return "Late night";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

export function formatDeadline(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.ceil((then - now.getTime()) / DAY);
  if (days < 0) return "Closed";
  if (days === 0) return "Closes today";
  if (days === 1) return "1 day left";
  return `${days} days left`;
}

/**
 * Strips control characters and clamps length before user-entered text is
 * stored or rendered. React escapes output, so this guards persistence quality
 * rather than XSS, which is already handled by never injecting raw HTML.
 */
export function sanitiseText(value: string, maxLength = 600): string {
  let out = "";
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    const isControl = code < 0x20 || (code >= 0x7f && code <= 0x9f);
    const isInvisible = code === 0x200b || code === 0x200c || code === 0x200d || code === 0xfeff;
    if (isControl || isInvisible) continue;
    out += char;
  }
  return out.replace(/\s+/g, " ").trim().slice(0, maxLength);
}

/** Only http(s) links may ever be handed to an anchor built from data. */
export function isSafeExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}
