"use client";

import { Sheet } from "@/components/ui/sheet";

type Guide = { title: string; intro: string; head: string[]; rows: (string | number)[][]; tip: string };

const GUIDES: Record<string, Guide> = {
  RING: {
    title: "Ring size guide",
    intro: "Measure the inner diameter of a ring that fits you well, or wrap a strip of paper around your finger and measure the circumference.",
    head: ["Indian size", "Diameter (mm)", "Circumference (mm)"],
    rows: [
      [6, 15.6, 49.0],
      [8, 16.2, 51.0],
      [10, 16.9, 53.0],
      [12, 17.5, 55.0],
      [14, 18.1, 57.0],
      [16, 18.8, 59.0],
      [18, 19.4, 61.0],
    ],
    tip: "Between sizes? Pick the larger one — fingers swell slightly through the day.",
  },
  BANGLE: {
    title: "Bangle size guide",
    intro: "Measure the inner diameter of a bangle you own, edge to edge across the widest part.",
    head: ["Size", "Inner diameter (mm)", "Inner circumference (mm)"],
    rows: [
      ["2.2", 54.0, 169.6],
      ["2.4", 57.2, 179.6],
      ["2.6", 60.3, 189.5],
      ["2.8", 63.5, 199.5],
      ["2.10", 66.7, 209.5],
    ],
    tip: "Bring your thumb and little finger together and measure around the widest part of your hand if you have no bangle to measure.",
  },
  CHAIN: {
    title: "Chain length guide",
    intro: "Chain length is measured end to end including the clasp.",
    head: ["Length", "Where it sits"],
    rows: [
      ['14"', "Choker — around the base of the neck"],
      ['16"', "Collarbone — classic pendant length"],
      ['18"', "Just below the collarbone — most popular"],
      ['20"', "A few inches below the collarbone"],
      ['22"', "At or just above the neckline"],
      ['24"', "Below the neckline — ideal for layering"],
    ],
    tip: "Layering? Keep 2 inches between each chain so pendants don't tangle.",
  },
  BRACELET: {
    title: "Bracelet size guide",
    intro: "Measure your wrist just below the wrist bone, then add 1–2 cm for a comfortable fit.",
    head: ["Size", "Wrist (cm)", "Bracelet length (cm)"],
    rows: [
      ["S", "14 – 15", 16.5],
      ["M", "15 – 16.5", 18],
      ["L", "16.5 – 18", 19.5],
    ],
    tip: "Most of our bracelets include an extension chain for an adjustable fit.",
  },
};

export function SizeGuide({ kind, open, onOpenChange }: { kind: string | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const guide = GUIDES[kind ?? ""] ?? GUIDES.RING;
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title={guide.title} description={guide.intro}>
      <div className="overflow-hidden rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-[12px] uppercase tracking-wide text-muted">
            <tr>
              {guide.head.map((h) => (
                <th key={h} className="px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {guide.rows.map((r) => (
              <tr key={String(r[0])}>
                {r.map((c, i) => (
                  <td key={i} className={i === 0 ? "px-4 py-3 font-medium text-ink" : "px-4 py-3 text-ink-soft"}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-5 rounded-2xl bg-blush px-4 py-3 text-sm text-ink-soft">
        <span className="font-medium text-ink">Tip: </span>
        {guide.tip}
      </p>
      <p className="mt-4 text-xs text-muted">Wrong size? Exchanges are free within 30 days of delivery.</p>
    </Sheet>
  );
}
