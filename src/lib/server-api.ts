import { API_BASE } from "./config";
import { ApiError, toApiError } from "./api-error";

type ServerFetchOptions = {
  /** Seconds before the cached response is refreshed. */
  revalidate?: number | false;
  tags?: string[];
};

/** Public, cacheable GET for Server Components (catalog, content, settings). */
export async function getJson<T>(path: string, { revalidate = 60, tags }: ServerFetchOptions = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate, tags },
  });
  if (!res.ok) throw await toApiError(res);
  return (await res.json()) as T;
}

/** Like `getJson`, but resolves to `null` on 404 so pages can call `notFound()`. */
export async function getJsonOrNull<T>(path: string, opts?: ServerFetchOptions): Promise<T | null> {
  try {
    return await getJson<T>(path, opts);
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

/**
 * Resolve to a fallback when the API is unreachable, so shared chrome (header, footer)
 * still renders and the build doesn't fail while the backend is down.
 */
export async function getJsonSafe<T>(path: string, fallback: T, opts?: ServerFetchOptions): Promise<T> {
  try {
    return await getJson<T>(path, opts);
  } catch {
    return fallback;
  }
}
