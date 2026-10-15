/** Error thrown for non-2xx API responses. `fields` maps a body path to its validation message. */
export class ApiError extends Error {
  status: number;
  fields: Record<string, string>;

  constructor(status: number, message: string, fields: Record<string, string> = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

type ErrorBody = { message?: string; details?: { path?: string; message?: string }[] | unknown };

export async function toApiError(res: Response): Promise<ApiError> {
  let body: ErrorBody = {};
  try {
    body = (await res.json()) as ErrorBody;
  } catch {
    // Non-JSON error (proxy page, empty body): fall through to the generic message.
  }
  const fields: Record<string, string> = {};
  if (Array.isArray(body.details)) {
    for (const d of body.details as { path?: string; message?: string }[]) {
      if (d?.path && d.message && !fields[d.path]) fields[d.path] = d.message;
    }
  }
  // Validation messages arrive as "path: message, …"; show the first message on its own.
  const first = Object.values(fields)[0];
  const message =
    first ??
    body.message ??
    (res.status === 429 ? "Too many attempts. Please wait a moment and try again." : "Something went wrong. Please try again.");
  return new ApiError(res.status, message, fields);
}

export function errorMessage(err: unknown, fallback = "Something went wrong. Please try again.") {
  if (err instanceof ApiError) return err.message;
  if (err instanceof TypeError) return "Can't reach the store right now. Check your connection and try again.";
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
