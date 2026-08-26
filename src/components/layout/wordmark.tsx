import { cn } from "@/lib/cn";

/**
 * The SIDEQUEST mark: a shield silhouette with a quest arrow cut out of it.
 * Prevention plus participation, in one shape that still reads at 24px.
 *
 * Two tones. The gradient is the brand expression and is used at wordmark size.
 * The solid tone exists for the elevated Safe control, where a violet gradient
 * on a violet button would disappear: there the shield is knocked out in white
 * and the arrow shows the button colour through it, which stays legible at the
 * 28px the navigation renders it at.
 */
export function Mark({
  className,
  tone = "solid",
  style,
}: {
  className?: string;
  tone?: "gradient" | "solid";
  style?: React.CSSProperties;
}) {
  const gradient = tone === "gradient";

  /*
   * The gradient tone is the logo and names itself. The solid tone is only ever
   * used as an icon inside an already-labelled control, so it must not
   * contribute to that control's accessible name: without this, the Safe tab
   * announced itself as "SIDEQUEST Safe".
   */
  const labelProps = gradient
    ? ({ role: "img", "aria-label": "SIDEQUEST" } as const)
    : ({ "aria-hidden": true } as const);

  return (
    <svg
      viewBox="0 0 32 32"
      {...labelProps}
      className={cn("size-8", className)}
      style={style}
    >
      {gradient ? (
        <defs>
          <linearGradient id="sq-mark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#8b78ff" />
            <stop offset="55%" stopColor="#6e56f8" />
            <stop offset="100%" stopColor="#22cde6" />
          </linearGradient>
        </defs>
      ) : null}

      <path
        d="M16 2.5 4.5 7v9.2c0 6.4 4.7 11.6 11.5 13.3 6.8-1.7 11.5-6.9 11.5-13.3V7L16 2.5Z"
        fill={gradient ? "url(#sq-mark)" : "currentColor"}
      />
      <path
        d="M12.2 19.8 19.4 12.6M19.4 12.6h-5.1M19.4 12.6v5.1"
        fill="none"
        stroke={gradient ? "#06070c" : "var(--sq-mark-knockout, #06070c)"}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Mark tone="gradient" />
      <span className="font-display text-lg font-extrabold tracking-[-0.03em] text-chalk">
        SIDE<span className="text-quest-300">QUEST</span>
      </span>
    </span>
  );
}
