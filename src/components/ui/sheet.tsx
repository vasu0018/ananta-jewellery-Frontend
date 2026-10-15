"use client";

import * as React from "react";
import { Dialog } from "radix-ui";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

type Side = "right" | "left" | "bottom" | "center";

const panel: Record<Side, string> = {
  right: "inset-y-0 right-0 h-dvh w-full max-w-[440px] animate-slide-in-right",
  left: "inset-y-0 left-0 h-dvh w-[86vw] max-w-[380px] animate-slide-in-left",
  bottom: "inset-x-0 bottom-0 max-h-[88dvh] rounded-t-3xl animate-slide-up",
  center:
    "left-1/2 top-1/2 max-h-[90dvh] w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl animate-fade-in",
};

type SheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  side?: Side;
  title: React.ReactNode;
  /** Visually hide the title (it stays available to screen readers). */
  hideTitle?: boolean;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
};

/** Drawer / modal built on Radix Dialog: focus trap, Esc to close, scroll lock. */
export function Sheet({ open, onOpenChange, side = "right", title, hideTitle, description, footer, className, bodyClassName, children }: SheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 animate-fade-in bg-ink/40 backdrop-blur-[2px]" />
        <Dialog.Content className={cn("fixed z-50 flex flex-col bg-white shadow-lift outline-none", panel[side], className)}>
          <div className={cn("flex items-start justify-between gap-4 px-5 pt-5 pb-3 sm:px-6", hideTitle && "absolute right-0 top-0 z-10 p-3")}>
            <div className={cn(hideTitle && "sr-only")}>
              <Dialog.Title className="font-display text-2xl font-medium text-ink">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-0.5 text-sm text-muted">{description}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{typeof title === "string" ? title : "Dialog"}</Dialog.Description>
              )}
            </div>
            <Dialog.Close
              className="-mr-2 grid size-10 shrink-0 place-items-center rounded-full bg-white/90 text-ink transition hover:bg-cream"
              aria-label="Close"
            >
              <X className="size-5" />
            </Dialog.Close>
          </div>
          <div className={cn("min-h-0 flex-1 overflow-y-auto px-5 pb-5 sm:px-6", bodyClassName)}>{children}</div>
          {footer && <div className="border-t border-line px-5 py-4 sm:px-6">{footer}</div>}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
