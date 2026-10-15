"use client";

import { useEffect, useState } from "react";

/** Peach top bar; "·"-separated announcement messages rotate one at a time. */
export function AnnouncementBar({ text }: { text: string }) {
  const parts = text
    .split("·")
    .map((s) => s.trim())
    .filter(Boolean);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (parts.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % parts.length), 3500);
    return () => clearInterval(t);
  }, [parts.length]);

  if (!parts.length) return null;
  return (
    <div className="bg-peach text-ink" role="region" aria-label="Store announcements">
      <p className="sr-only">{parts.join(". ")}</p>
      <div className="relative h-[31px] overflow-hidden" aria-hidden>
        {parts.map((msg, i) => (
          <p
            key={msg}
            className={`absolute inset-0 flex items-center justify-center px-4 text-center text-[12.5px] transition-all duration-500 sm:text-[13px] ${
              i === index % parts.length ? "translate-y-0 opacity-100" : i < index % parts.length ? "-translate-y-full opacity-0" : "translate-y-full opacity-0"
            }`}
          >
            {msg}
          </p>
        ))}
      </div>
    </div>
  );
}
