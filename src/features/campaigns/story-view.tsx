import { cn } from "@/lib/cn";
import type { StorySegment } from "@/types/campaign";

/**
 * Renders a story beat.
 *
 * Short lines, generous spacing, and message exchanges as actual chat bubbles.
 * Nobody standing at a roadshow reads a paragraph, so the content model does
 * not allow one.
 */
export function StoryView({
  segment,
  className,
}: {
  segment: StorySegment;
  className?: string;
}) {
  return (
    <div className={cn("space-y-4", className)}>
      {segment.slug ? (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-faint">
          {segment.slug}
        </p>
      ) : null}

      <div className="space-y-3">
        {segment.lines.map((line, index) => (
          <p key={index} className="text-lg leading-relaxed text-chalk">
            {line}
          </p>
        ))}
      </div>

      {segment.messages?.length ? (
        <ul className="space-y-2 pt-1">
          {segment.messages.map((message, index) => (
            <li
              key={index}
              className={cn("flex", message.isYou ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-3.5 py-2",
                  message.isYou
                    ? "rounded-br-sm bg-quest-500/20 text-chalk"
                    : "rounded-bl-sm bg-white/6 text-mist",
                )}
              >
                {!message.isYou ? (
                  <p className="text-[0.65rem] font-bold uppercase tracking-wide text-faint">
                    {message.from}
                  </p>
                ) : null}
                <p className="text-sm leading-snug">{message.text}</p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
