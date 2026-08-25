import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "volt" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-quest-500 text-white hover:bg-quest-400 active:bg-quest-600 shadow-[0_10px_30px_-12px_rgba(110,86,248,0.9)]",
  volt: "bg-volt-500 text-ink-900 hover:bg-volt-400 active:bg-volt-600 shadow-[0_10px_30px_-12px_rgba(180,255,61,0.7)]",
  secondary:
    "bg-white/6 text-chalk hover:bg-white/10 active:bg-white/14 border border-white/10",
  ghost: "bg-transparent text-mist hover:bg-white/6 hover:text-chalk",
  danger: "bg-coral-500 text-ink-900 hover:bg-coral-400 active:bg-coral-600",
};

const SIZES: Record<Size, string> = {
  // 44px minimum height everywhere, per the mobile touch target target.
  sm: "min-h-11 px-4 text-sm gap-2",
  md: "min-h-12 px-5 text-[0.95rem] gap-2.5",
  lg: "min-h-14 px-6 text-base gap-3",
};

const BASE =
  "inline-flex items-center justify-center rounded-full font-semibold tracking-tight sq-pressable disabled:opacity-40 disabled:pointer-events-none select-none";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  full?: boolean;
  className?: string;
  children: ReactNode;
}

type ButtonProps = CommonProps & Omit<ComponentPropsWithoutRef<"button">, "className" | "children">;

export function Button({
  variant = "primary",
  size = "md",
  full,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(BASE, VARIANTS[variant], SIZES[size], full && "w-full", className)}
      {...rest}
    >
      {children}
    </button>
  );
}

type ButtonLinkProps = CommonProps & { href: string } & Omit<
    ComponentPropsWithoutRef<"a">,
    "className" | "children" | "href"
  >;

export function ButtonLink({
  variant = "primary",
  size = "md",
  full,
  className,
  children,
  href,
  ...rest
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(BASE, VARIANTS[variant], SIZES[size], full && "w-full", className)}
      {...rest}
    >
      {children}
    </Link>
  );
}
