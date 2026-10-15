import { Gem, Gift, Sparkles, Truck } from "lucide-react";

const PERKS = [
  { icon: Gift, text: "Welcome points on your first sign-up" },
  { icon: Sparkles, text: "Early access to new drops & members-only offers" },
  { icon: Truck, text: "Faster checkout with saved addresses" },
  { icon: Gem, text: "Track orders, returns and lifetime plating" },
];

/** Two-column frame for sign-in / sign-up / password pages. */
export function AuthShell({ title, subtitle, children }: { title: string; subtitle?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="container-x py-10 sm:py-16">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-3xl border border-line bg-white shadow-soft lg:grid-cols-[1fr_1.1fr]">
        <aside className="relative hidden overflow-hidden bg-gradient-to-br from-blush via-cream to-[#f3e6d4] p-10 lg:block">
          <div className="absolute -right-24 -top-24 size-72 rounded-full border border-gold/30" aria-hidden />
          <div className="absolute -bottom-32 -left-16 size-80 rounded-full border border-rose/20" aria-hidden />
          <p className="eyebrow mb-3">The Ananta circle</p>
          <p className="max-w-xs font-display text-4xl leading-tight text-ink">Jewellery that celebrates every you.</p>
          <ul className="relative mt-10 space-y-4">
            {PERKS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-ink-soft">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-white/80 text-rose">
                  <Icon className="size-4" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </aside>
        <div className="p-6 sm:p-10">
          <h1 className="font-display text-4xl text-ink">{title}</h1>
          {subtitle && <p className="mt-2 text-[15px] text-muted">{subtitle}</p>}
          <div className="mt-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
