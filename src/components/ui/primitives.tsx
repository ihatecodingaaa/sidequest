import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/cn";
import { ACCENT_BG_SOFT, ACCENT_BORDER, ACCENT_TEXT, type Accent } from "@/lib/accent";
import type { DataProvenance } from "@/types/core";
import { isSafeExternalUrl } from "@/lib/format";

/* ---------------------------------------------------------------- Card */

export function Card({
  className,
  children,
  as: Tag = "div",
  ...rest
}: { className?: string; children: ReactNode; as?: ElementType } & Omit<
  ComponentPropsWithoutRef<"div">,
  "className" | "children"
>) {
  return (
    <Tag className={cn("sq-card p-4", className)} {...rest}>
      {children}
    </Tag>
  );
}

/* ---------------------------------------------------------------- Chip */

export function Chip({
  children,
  accent,
  className,
}: {
  children: ReactNode;
  accent?: Accent;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.08em]",
        accent
          ? cn(ACCENT_BG_SOFT[accent], ACCENT_BORDER[accent], ACCENT_TEXT[accent])
          : "border-white/10 bg-white/5 text-mist",
        className,
      )}
    >
      {children}
    </span>
  );
}

/* -------------------------------------------------- Provenance labelling */

const PROVENANCE_COPY: Record<DataProvenance, { label: string; title: string; accent: Accent }> = {
  "official-source": {
    label: "Official source",
    title: "Links out to the agency that owns this service.",
    accent: "pulse",
  },
  seeded: {
    label: "Prototype content",
    title: "Written by the SIDEQUEST team from public advisories. Not a live feed.",
    accent: "quest",
  },
  "demo-aggregate": {
    label: "Demo aggregate",
    title: "Illustrative placeholder numbers, not survey results.",
    accent: "gold",
  },
  "partner-concept": {
    label: "Partner concept",
    title: "A proposal. No organisation has committed to this.",
    accent: "coral",
  },
};

/**
 * The single component responsible for keeping prototype data distinguishable
 * from real data. If content is seeded, invented or unconfirmed, it wears one
 * of these.
 */
export function ProvenanceTag({
  provenance,
  className,
  compact,
}: {
  provenance: DataProvenance;
  className?: string;
  compact?: boolean;
}) {
  const copy = PROVENANCE_COPY[provenance];
  return (
    <span
      title={copy.title}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 font-semibold tracking-[0.06em] uppercase",
        compact ? "text-[0.6rem]" : "text-[0.65rem]",
        ACCENT_BG_SOFT[copy.accent],
        ACCENT_BORDER[copy.accent],
        ACCENT_TEXT[copy.accent],
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {copy.label}
    </span>
  );
}

/* ------------------------------------------------------- Section header */

export function SectionHeader({
  id,
  title,
  action,
  href,
  subtitle,
  className,
}: {
  id?: string;
  title: string;
  subtitle?: string;
  action?: string;
  href?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 id={id} className="text-lg font-bold tracking-tight text-chalk">
          {title}
        </h2>
        {subtitle ? <p className="mt-0.5 text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action && href ? (
        <Link
          href={href}
          className="shrink-0 rounded-full px-2 py-1 text-sm font-semibold text-quest-300 hover:text-quest-400"
        >
          {action}
        </Link>
      ) : null}
    </div>
  );
}

/* --------------------------------------------------------- Progress bar */

export function ProgressBar({
  value,
  accent = "volt",
  className,
  label,
}: {
  /** 0 to 1. */
  value: number;
  accent?: Accent;
  className?: string;
  label?: string;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  const fill: Record<Accent, string> = {
    quest: "bg-quest-500",
    pulse: "bg-pulse-500",
    volt: "bg-volt-500",
    coral: "bg-coral-500",
    gold: "bg-gold-500",
  };

  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-white/8", className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", fill[accent])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

/* -------------------------------------------------------- External link */

/**
 * The only way an outbound link should ever be rendered. Enforces
 * `rel="noreferrer"` and refuses anything that is not http(s), which closes off
 * javascript: and data: URLs arriving from data.
 */
export function ExternalLink({
  href,
  children,
  className,
  showIcon = true,
  ...rest
}: {
  href: string;
  children: ReactNode;
  className?: string;
  showIcon?: boolean;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "className" | "children">) {
  const isTel = href.startsWith("tel:");
  if (!isTel && !isSafeExternalUrl(href)) return <span className={className}>{children}</span>;

  return (
    <a
      href={href}
      target={isTel ? undefined : "_blank"}
      rel={isTel ? undefined : "noopener noreferrer"}
      className={className}
      {...rest}
    >
      {children}
      {showIcon && !isTel ? (
        <ArrowUpRight aria-hidden className="size-4 shrink-0 opacity-70" />
      ) : null}
    </a>
  );
}

/* ------------------------------------------------------------ Stat tile */

export function StatTile({
  label,
  value,
  hint,
  accent = "quest",
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: Accent;
}) {
  return (
    <div className="sq-card-flat px-3.5 py-3">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-faint">{label}</p>
      <p className={cn("mt-1 font-display text-2xl font-bold tabular-nums", ACCENT_TEXT[accent])}>
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}

/* ----------------------------------------------------------- EmptyState */

export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon?: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="sq-card flex flex-col items-center gap-3 px-6 py-10 text-center">
      {icon ? <div className="text-faint">{icon}</div> : null}
      <div>
        <p className="font-display text-base font-bold text-chalk">{title}</p>
        <p className="mx-auto mt-1 max-w-xs text-sm text-muted">{body}</p>
      </div>
      {action}
    </div>
  );
}

/* -------------------------------------------------------------- Skeleton */

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-white/6",
        className,
      )}
    />
  );
}
