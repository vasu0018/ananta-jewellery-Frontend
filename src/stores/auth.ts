"use client";

import { create } from "zustand";
import type { Customer } from "@/lib/types";

/**
 * Customer session. The access token lives in memory only; the refresh token is an
 * httpOnly cookie set by the API. `aj-session` in localStorage is just a hint that a
 * cookie probably exists, so guests don't trigger a failing refresh on every visit.
 */
type AuthStatus = "loading" | "authenticated" | "guest";

type AuthState = {
  status: AuthStatus;
  accessToken: string | null;
  customer: Customer | null;
  setSession: (accessToken: string, customer: Customer) => void;
  setCustomer: (customer: Customer) => void;
  clear: () => void;
};

const HINT_KEY = "aj-session";

export const hasSessionHint = () => typeof window !== "undefined" && window.localStorage.getItem(HINT_KEY) === "1";

export const useAuth = create<AuthState>((set) => ({
  status: "loading",
  accessToken: null,
  customer: null,
  setSession: (accessToken, customer) => {
    window.localStorage.setItem(HINT_KEY, "1");
    set({ status: "authenticated", accessToken, customer });
  },
  setCustomer: (customer) => set({ customer }),
  clear: () => {
    if (typeof window !== "undefined") window.localStorage.removeItem(HINT_KEY);
    set({ status: "guest", accessToken: null, customer: null });
  },
}));
