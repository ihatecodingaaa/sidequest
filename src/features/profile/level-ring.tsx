import { cn } from "@/lib/cn";

/** Circular level indicator. Pure SVG so it scales cleanly and costs nothing. */
export function LevelRing({
  fraction,
  level,
  title,
  className,
}: {
  fraction: number;
  level: number;
  title: string;
  className?: string;
}) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(1, Math.max(0, fraction));

  return (
    <div className={cn("relative grid size-28 place-items-center", className)}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90" aria-hidden>
        <defs>
          <linearGradient id="sq-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#b4ff3d" />
            <stop offset="100%" stopColor="#22cde6" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="7" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="url(#sq-ring)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="text-center">
        <p className="font-display text-3xl leading-none font-extrabold text-chalk tabular-nums">
          {level}
        </p>
        <p className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.1em] text-volt-300">
          {title}
        </p>
      </div>
    </div>
  );
}
