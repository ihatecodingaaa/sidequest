/**
 * Recency labels for seeded Pulse content.
 *
 * The offset is a plain number in the fixture rather than a timestamp, so this
 * renders identically on the server and the client and does not drift between
 * demo days. Seeded items are never labelled "live"; the provenance tag next to
 * the label says what the content actually is.
 */
export function offsetLabel(hours: number): string {
  if (hours < 1) return "Just now";
  if (hours < 24) return `${Math.round(hours)}h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}
