import { House, Newspaper, Swords, ShieldCheck, User, type LucideIcon } from "lucide-react";

import type { Accent } from "@/lib/accent";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  accent: Accent;
  /** Extra routes that should light this tab up. */
  matches?: string[];
  description: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: House,
    accent: "quest",
    description: "Your day at a glance",
  },
  {
    href: "/pulse",
    label: "Pulse",
    icon: Newspaper,
    accent: "pulse",
    matches: ["/pulse", "/radio"],
    description: "What is happening",
  },
  {
    href: "/missions",
    label: "Missions",
    icon: Swords,
    accent: "quest",
    matches: ["/missions", "/play"],
    description: "Do something",
  },
  {
    href: "/safe",
    label: "Safe",
    icon: ShieldCheck,
    accent: "coral",
    description: "Official help, fast",
  },
  {
    href: "/you",
    label: "You",
    icon: User,
    accent: "volt",
    matches: ["/you", "/rewards", "/crew", "/settings"],
    description: "Progress and passport",
  },
];

export function isActive(pathname: string, item: NavItem): boolean {
  const candidates = item.matches ?? [item.href];
  if (item.href === "/") return pathname === "/";
  return candidates.some((base) => pathname === base || pathname.startsWith(`${base}/`));
}
