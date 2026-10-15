"use client";

import { useNow } from "@/hooks/useNow";
import { cn } from "@/lib/utils";

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

/** Live countdown to `endsAt`. Renders nothing until mounted so server and client markup agree. */
export function Countdown({ endsAt, className, compact }: { endsAt: string; className?: string; compact?: boolean }) {
  const now = useNow();
  if (now === null) return <span className={cn("inline-block min-h-[1em]", className)} />;
  const { d, h, m, s } = parts(new Date(endsAt).getTime() - now);
  const pad = (n: number) => String(n).padStart(2, "0");

  if (compact) {
    return (
      <span className={cn("tabular-nums", className)}>
        {d > 0 ? `${d}d ` : ""}
        {pad(h)}:{pad(m)}:{pad(s)}
      </span>
    );
  }
  const cells = [
    ...(d > 0 ? [{ v: d, l: "Days" }] : []),
    { v: h, l: "Hrs" },
    { v: m, l: "Min" },
    { v: s, l: "Sec" },
  ];
  return (
    <div className={cn("flex items-center gap-2", className)} role="timer" aria-label="Time left in sale">
      {cells.map((c, i) => (
        <div key={c.l} className="flex items-center gap-2">
          <div className="min-w-14 rounded-xl bg-white px-2 py-1.5 text-center shadow-soft">
            <div className="font-display text-2xl font-semibold tabular-nums text-ink">{pad(c.v)}</div>
            <div className="text-[10px] uppercase tracking-[0.14em] text-muted">{c.l}</div>
          </div>
          {i < cells.length - 1 && <span className="font-display text-xl text-gold">:</span>}
        </div>
      ))}
    </div>
  );
}
