import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { inr } from "@/lib/format";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

export function Stars({ value, size = 14, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)));
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star className="absolute inset-0 text-line-strong" style={{ width: size, height: size }} strokeWidth={1.5} />
            {fill > 0 && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star className="fill-gold text-gold" style={{ width: size, height: size }} strokeWidth={1.5} />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

export function Price({
  price,
  compareAtPrice,
  discountPct,
  size = "md",
  className,
}: {
  price: number;
  compareAtPrice?: number | null;
  discountPct?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const hasMrp = !!compareAtPrice && compareAtPrice > price;
  const pct = discountPct ?? (hasMrp ? Math.round(((compareAtPrice! - price) / compareAtPrice!) * 100) : 0);
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 gap-y-0.5", className)}>
      <span className={cn("font-bold text-ink", size === "lg" ? "text-[28px]" : size === "md" ? "text-[17px]" : "text-[15px]")}>{inr(price)}</span>
      {hasMrp && (
        <>
          <span className={cn("text-[#8a8a8a] line-through", size === "lg" ? "text-[18px]" : "text-[13px]")}>{inr(compareAtPrice)}</span>
          {pct > 0 && <span className={cn("font-bold text-rose", size === "lg" ? "text-[16px]" : "text-[13px]")}>{pct}% OFF</span>}
        </>
      )}
    </div>
  );
}

export function Badge({ children, tone = "ink", className }: { children: React.ReactNode; tone?: "ink" | "rose" | "gold" | "cream" | "success"; className?: string }) {
  const tones = {
    ink: "bg-ink text-white",
    rose: "bg-rose text-white",
    gold: "bg-gold-soft text-[#8a5a12]",
    cream: "bg-white/95 text-ink",
    success: "bg-[#e6f3ec] text-success",
  };
  return <span className={cn("inline-flex items-center rounded-[4px] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.04em]", tones[tone], className)}>{children}</span>;
}

export function Spinner({ className }: { className?: string }) {
  return <span className={cn("inline-block size-5 animate-spin rounded-full border-2 border-line-strong border-t-ink", className)} aria-label="Loading" />;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  if (align === "left") {
    return (
      <div className={cn("mb-8 flex flex-wrap items-end justify-between gap-4", className)}>
        <div>
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h2 className="section-title">{title}</h2>
          {description && <p className="mt-2 max-w-xl text-[15px] text-muted">{description}</p>}
        </div>
        {action}
      </div>
    );
  }
  return (
    <div className={cn("mb-6 text-center sm:mb-8", className)}>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h2 className="section-title">{title}</h2>
      {description && <p className="mx-auto mt-2 max-w-xl text-[15px] text-[#121212bf]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center px-6 py-16 text-center">
      {icon && <div className="mb-5 grid size-20 place-items-center rounded-full bg-blush text-rose [&_svg]:size-8">{icon}</div>}
      <h3 className="text-[22px] font-bold text-ink">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-[15px] text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
