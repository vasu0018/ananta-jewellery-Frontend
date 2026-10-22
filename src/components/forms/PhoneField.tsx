"use client";

import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { COUNTRIES, cleanNational, countryByIso, flagEmoji, maxNationalLength } from "@/lib/phone";

function lengthHint(iso: string) {
  const lengths = countryByIso(iso).lengths;
  if (lengths.length === 1) return `${lengths[0]}-digit mobile number`;
  if (lengths.length === 2) return `${lengths[0]} or ${lengths[1]} digits`;
  return `${lengths[0]}–${lengths[lengths.length - 1]} digits`;
}

export function PhoneField({
  iso,
  national,
  onChange,
  label = "Mobile number",
  hint,
  error,
  required,
  variant = "field",
  autoComplete = "tel-national",
  autoFocus,
  className,
}: {
  iso: string;
  national: string;
  onChange: (next: { iso: string; national: string }) => void;
  label?: ReactNode;
  hint?: string;
  error?: string;
  required?: boolean;
  variant?: "field" | "login";
  autoComplete?: string;
  autoFocus?: boolean;
  className?: string;
}) {
  const listId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const country = countryByIso(iso);
  const describedBy = error ? `${listId}-error` : hint || variant === "field" ? `${listId}-hint` : undefined;
  const shownHint = hint ?? (variant === "field" ? lengthHint(iso) : undefined);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/^\+/, "");
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.name.toLowerCase().includes(q) || c.dial.includes(q) || c.iso.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    searchRef.current?.focus();
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const pick = (nextIso: string) => {
    onChange({ iso: nextIso, national: cleanNational(nextIso, national) });
    setOpen(false);
    setQuery("");
  };

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      {variant === "field" && (
        <label htmlFor={`${listId}-input`} className="label">
          {label}
          {required && <span className="text-rose"> *</span>}
        </label>
      )}
      <div
        className={cn(
          "flex items-center overflow-hidden bg-white",
          variant === "login"
            ? "h-14 rounded-[9px] border border-[#a5a5a5] focus-within:border-ink"
            : "h-12 rounded-[7px] border border-line-strong focus-within:border-ink focus-within:ring-2 focus-within:ring-ink/5",
          error && "border-danger",
        )}
      >
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Country code, ${country.name} +${country.dial}`}
          onClick={() => setOpen((v) => !v)}
          className="flex h-full shrink-0 cursor-pointer items-center gap-1 border-r border-line px-2.5 text-[14px] text-ink hover:bg-[#ffe8ee]"
        >
          <span aria-hidden className="text-[18px] leading-none">
            {flagEmoji(country.iso)}
          </span>
          <span className="font-semibold">+{country.dial}</span>
          <ChevronDown size={14} className={cn("text-muted transition-transform", open && "rotate-180")} />
        </button>
        <input
          id={`${listId}-input`}
          inputMode="numeric"
          autoComplete={autoComplete}
          placeholder={lengthHint(iso)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          maxLength={maxNationalLength(iso)}
          autoFocus={autoFocus}
          value={national}
          onChange={(e) => onChange({ iso, national: cleanNational(iso, e.target.value) })}
          className="h-full min-w-0 flex-1 bg-transparent px-3 text-[15px] outline-none placeholder:text-[#9a9a9a]"
        />
      </div>
      {open && (
        <div className="absolute left-0 top-[calc(100%+6px)] z-40 w-[min(100vw-2rem,320px)] overflow-hidden rounded-[10px] border border-line bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
          <div className="flex items-center gap-2 border-b border-line px-3">
            <Search size={15} className="text-muted" />
            <input
              ref={searchRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search country or code"
              aria-label="Search country"
              className="h-10 w-full bg-transparent text-[14px] outline-none"
            />
          </div>
          <ul id={listId} role="listbox" aria-label="Country codes" className="max-h-64 overflow-y-auto py-1">
            {matches.length === 0 && <li className="px-3 py-3 text-[13px] text-muted">No country matches that search</li>}
            {matches.map((c) => {
              const selected = c.iso === country.iso;
              return (
                <li key={c.iso} role="option" aria-selected={selected}>
                  <button
                    type="button"
                    onClick={() => pick(c.iso)}
                    className={cn("flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left text-[14px] hover:bg-[#ffe8ee]", selected && "bg-blush/70")}
                  >
                    <span aria-hidden className="text-[18px] leading-none">
                      {flagEmoji(c.iso)}
                    </span>
                    <span className="min-w-0 flex-1 truncate">{c.name}</span>
                    <span className="text-muted">+{c.dial}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {error ? (
        <p id={`${listId}-error`} className="mt-1 text-[12px] text-danger">
          {error}
        </p>
      ) : (
        shownHint && (
          <p id={`${listId}-hint`} className="mt-1 text-[12px] text-muted">
            {shownHint}
          </p>
        )
      )}
    </div>
  );
}
