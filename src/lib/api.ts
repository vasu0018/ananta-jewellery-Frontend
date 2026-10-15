"use client";

import { API_BASE } from "./config";
import { ApiError, toApiError } from "./api-error";
import { useAuth } from "@/stores/auth";
import type { Customer } from "./types";

export { ApiError };

type Options = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
};

let refreshing: Promise<string | null> | null = null;

/**
 * Exchange the refresh cookie for a new access token. Concurrent callers share one
 * request — the API rotates the cookie, so parallel refreshes would invalidate each other.
 */
export function refreshSession(): Promise<string | null> {
  refreshing ??= fetch(`${API_BASE}/auth/refresh`, { method: "POST", credentials: "include" })
    .then(async (res) => {
      if (!res.ok) return null;
      const data = (await res.json()) as { accessToken: string; customer: Customer };
      useAuth.getState().setSession(data.accessToken, data.customer);
      return data.accessToken;
    })
    .catch(() => null)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

async function send(path: string, opts: Options, token: string | null) {
  const isForm = typeof FormData !== "undefined" && opts.body instanceof FormData;
  const headers: Record<string, string> = { Accept: "application/json" };
  if (opts.body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`${API_BASE}${path}`, {
    method: opts.method ?? (opts.body !== undefined ? "POST" : "GET"),
    headers,
    body: opts.body === undefined ? undefined : isForm ? (opts.body as FormData) : JSON.stringify(opts.body),
    credentials: "include",
    signal: opts.signal,
  });
}

/**
 * Browser API client. Adds the bearer token, and on a 401 refreshes once and retries.
 * Auth endpoints are excluded because their 401s mean "wrong credentials", not "expired".
 */
export async function api<T>(path: string, opts: Options = {}): Promise<T> {
  const token = useAuth.getState().accessToken;
  let res = await send(path, opts, token);

  if (res.status === 401 && token && !path.startsWith("/auth/")) {
    const fresh = await refreshSession();
    if (!fresh) {
      useAuth.getState().clear();
      throw new ApiError(401, "Your session has expired. Please sign in again.");
    }
    res = await send(path, opts, fresh);
  }

  if (!res.ok) throw await toApiError(res);
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

/** Fetch a binary (e.g. invoice PDF) with auth and open it in a new tab. */
export async function openAuthedFile(path: string) {
  const win = window.open("", "_blank");
  try {
    let token = useAuth.getState().accessToken;
    let res = await fetch(`${API_BASE}${path}`, { headers: token ? { Authorization: `Bearer ${token}` } : {}, credentials: "include" });
    if (res.status === 401) {
      token = await refreshSession();
      if (token) res = await fetch(`${API_BASE}${path}`, { headers: { Authorization: `Bearer ${token}` }, credentials: "include" });
    }
    if (!res.ok) throw await toApiError(res);
    const url = URL.createObjectURL(await res.blob());
    if (win) win.location.href = url;
    else window.location.href = url;
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (err) {
    win?.close();
    throw err;
  }
}
