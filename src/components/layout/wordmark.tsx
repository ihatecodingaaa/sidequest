import { cn } from "@/lib/cn";

/**
 * The SIDEQUEST mark: a shield silhouette with a quest arrow cut out of it.
 * Prevention plus participation, in one shape that still reads at 24px.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      role="img"
      aria-label="SIDEQUEST"
      className={cn("size-8", className)}
    >
      <defs>
        <linearGradient id="sq-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b78ff" />
          <stop offset="55%" stopColor="#6e56f8" />
          <stop offset="100%" stopColor="#22cde6" />
        </linearGradient>
      </defs>
      <path
        d="M16 2.5 4.5 7v9.2c0 6.4 4.7 11.6 11.5 13.3 6.8-1.7 11.5-6.9 11.5-13.3V7L16 2.5Z"
        fill="url(#sq-mark)"
      />
      <path
        d="M12.2 19.8 19.4 12.6M19.4 12.6h-5.1M19.4 12.6v5.1"
        fill="none"
        stroke="#06070c"
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
      <Mark />
      <span className="font-display text-lg font-extrabold tracking-[-0.03em] text-chalk">
        SIDE<span className="text-quest-300">QUEST</span>
      </span>
    </span>
  );
}
