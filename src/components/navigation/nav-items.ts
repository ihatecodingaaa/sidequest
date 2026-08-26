import { House, Newspaper, ShieldCheck, Swords, User, type LucideIcon } from "lucide-react";

import type { Accent } from "@/lib/accent";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  accent: Accent;
  /** Extra routes that should light this tab up. */
  matches?: string[];
  /** Shown in the desktop rail. Answers "what is this for". */
  description: string;
  /**
   * Marks the elevated centre destination. It is still a tab: it navigates,
   * it takes aria-current, and it carries a label like its neighbours. The
   * emphasis is about recognisability, not about behaving differently.
   */
  isPrimary?: boolean;
}

/**
 * Five destinations, and the order matters.
 *
 * Safe sits in the centre so its position never changes and never has to be
 * remembered. That placement buys recognition and muscle memory rather than
 * speed: the centre of a five-item bar is actually the harder spot for a thumb
 * arcing from a bottom corner, which is why the Safe target is made taller
 * than its neighbours rather than merely wider.
 *
 * Each label answers a question the user is actually asking:
 *   Home     what is happening for me
 *   Updates  what should I know
 *   Safe     I need help
 *   Missions what can I do
 *   You      my progress
 *
 * "Pulse" was the label here until the UX audit flagged it (H8). An invented
 * word cannot be predicted by someone who has not used the app, and a tab bar
 * label's only job is prediction. Pulse survives as the section's name inside
 * the destination, where branding is free and navigation is not at stake. The
 * route stays /pulse: renaming URLs for cosmetic consistency would break every
 * link anyone has already shared.
 */
export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: House,
    accent: "quest",
    description: "What is happening for you",
  },
  {
    href: "/pulse",
    label: "Updates",
    icon: Newspaper,
    accent: "pulse",
    matches: ["/pulse", "/radio"],
    description: "What is worth knowing",
  },
  {
    href: "/safe",
    label: "Safe",
    icon: ShieldCheck,
    accent: "quest",
    description: "Official help, one tap away",
    isPrimary: true,
  },
  {
    href: "/missions",
    label: "Missions",
    icon: Swords,
    accent: "coral",
    matches: ["/missions", "/play", "/campaigns"],
    description: "Stories and challenges",
  },
  {
    href: "/you",
    label: "You",
    icon: User,
    accent: "volt",
    matches: ["/you", "/rewards", "/crew", "/settings"],
    description: "Your progress and passport",
  },
];

export function isActive(pathname: string, item: NavItem): boolean {
  const candidates = item.matches ?? [item.href];
  if (item.href === "/") return pathname === "/";
  return candidates.some((base) => pathname === base || pathname.startsWith(`${base}/`));
}
