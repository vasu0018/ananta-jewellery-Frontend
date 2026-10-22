"use client";

import { Children, isValidElement, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Option = { value: string; label: string; disabled?: boolean };

function optionLabel(node: ReactNode): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(optionLabel).join("");
  return "";
}

function optionsFrom(children: ReactNode): Option[] {
  const options: Option[] = [];
  Children.forEach(children, (child) => {
    if (!isValidElement<{ value?: string | number; children?: ReactNode; disabled?: boolean }>(child) || child.type !== "option") return;
    const label = optionLabel(child.props.children);
    const value = child.props.value === undefined ? label : String(child.props.value);
    options.push({ value, label: label || value, disabled: child.props.disabled });
  });
  return options;
}

/** Dropdown whose rows are real buttons, so the pointer cursor shows on every option. */
export function PointerSelect({
  value,
  onChange,
  disabled,
  className = "",
  children,
  id,
  "aria-label": ariaLabel,
  "aria-invalid": ariaInvalid,
}: {
  value?: string | number | readonly string[];
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  id?: string;
  "aria-label"?: string;
  "aria-invalid"?: boolean;
}) {
  const options = optionsFrom(children);
  const current = value == null ? "" : String(value);
  const selected = options.find((o) => o.value === current);
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const boxed = /\bfield\b/.test(className);
  const shrink = className.includes("!w-auto") || className.includes("w-auto") || !boxed;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={root} className={cn("relative", shrink ? "inline-block max-w-full" : "block w-full", className.includes("ml-auto") && "ml-auto")}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        aria-invalid={ariaInvalid || undefined}
        onClick={() => setOpen((v) => !v)}
        className={cn("flex cursor-pointer items-center justify-between gap-2 text-left disabled:cursor-not-allowed", className, boxed && "pr-10")}
      >
        <span className="min-w-0 truncate">{selected?.label || "Select"}</span>
        {boxed ? <ChevronDown className={cn("size-4 shrink-0 text-muted transition", open && "rotate-180")} /> : null}
      </button>
      {open ? (
        <div
          role="listbox"
          className={cn(
            "absolute z-40 mt-1 max-h-72 overflow-auto rounded-[8px] border border-line bg-white py-1 shadow-lift",
            shrink ? "right-0 min-w-[190px]" : "left-0 min-w-full",
          )}
        >
          {options.map((o, i) => {
            const on = o.value === current;
            return (
              <button
                key={`${o.value}-${i}`}
                type="button"
                role="option"
                aria-selected={on}
                disabled={o.disabled}
                className={cn(
                  "block w-full cursor-pointer whitespace-nowrap px-3 py-2 text-left text-[14px] text-ink hover:bg-[#ffe8ee] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent",
                  on && "bg-[#ffe8ee] font-semibold",
                )}
                onClick={() => {
                  if (o.disabled) return;
                  onChange?.({ target: { value: o.value } });
                  setOpen(false);
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
