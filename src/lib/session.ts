"use client";

import type { QueryClient } from "@tanstack/react-query";
import { api } from "./api";
import { useAuth } from "@/stores/auth";
import { useCart } from "@/stores/cart";
import { useWishlist } from "@/stores/lists";
import type { Customer } from "./types";

type SessionResponse = { accessToken: string; customer: Customer };

export async function login(email: string, password: string) {
  const data = await api<SessionResponse>("/auth/login", { body: { email, password } });
  useAuth.getState().setSession(data.accessToken, data.customer);
  return data.customer;
}

/** Creates the account and signs in — or, for an email used at guest checkout, returns the "check your inbox" message. */
export async function register(input: { name: string; email: string; phone?: string; password: string; acceptsMarketing?: boolean }) {
  const data = await api<SessionResponse | { verify: true; message: string }>("/auth/register", { body: input });
  if ("verify" in data) return { verify: true as const, message: data.message };
  useAuth.getState().setSession(data.accessToken, data.customer);
  return { verify: false as const, customer: data.customer };
}

/** Sign out and drop everything tied to the account (bag and wishlist stay on the server). */
export async function logout(queryClient?: QueryClient) {
  try {
    await api("/auth/logout", { method: "POST" });
  } catch {
    // Clearing local state is what matters; an expired cookie can't be revoked anyway.
  }
  useAuth.getState().clear();
  useCart.getState().hydrateFromServer([], null);
  useWishlist.getState().setAll([]);
  queryClient?.removeQueries({ predicate: (q) => q.queryKey[0] === "account" || q.queryKey[0] === "wishlist" });
}
