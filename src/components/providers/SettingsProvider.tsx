"use client";

import { createContext, useContext } from "react";
import type { Category, Collection, PublicSettings } from "@/lib/types";

export type ShellData = { settings: PublicSettings; categories: Category[]; collections: Collection[] };

const ShellContext = createContext<ShellData | null>(null);

/** Store settings + menu data fetched once in the root layout and shared with client components. */
export function SettingsProvider({ value, children }: { value: ShellData; children: React.ReactNode }) {
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

export function useShell() {
  const ctx = useContext(ShellContext);
  if (!ctx) throw new Error("useShell must be used inside <SettingsProvider>");
  return ctx;
}

export const useSettings = () => useShell().settings;
