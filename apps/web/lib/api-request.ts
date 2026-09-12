export const API_MAX_BODY_BYTES = 64 * 1024;

export class ApiRequestError extends Error {
  readonly status: 400 | 413;

  constructor(message: string, status: 400 | 413 = 400) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

export async function parseJsonBody<T>(request: Request, maxBytes = API_MAX_BODY_BYTES): Promise<T> {
  const contentLength = request.headers.get("content-length");
  if (contentLength) {
    const parsedLength = Number(contentLength);
    if (Number.isFinite(parsedLength) && parsedLength > maxBytes) throw new ApiRequestError("Request body is too large.", 413);
  }
  let text: string;
  try {
    text = await request.text();
  } catch {
    throw new ApiRequestError("Unable to read request body.");
  }
  if (new TextEncoder().encode(text).byteLength > maxBytes) throw new ApiRequestError("Request body is too large.", 413);
  if (!text.trim()) throw new ApiRequestError("Request body is required.");
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new ApiRequestError("Request body must be valid JSON.");
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function requiredString(value: unknown, field: string, maxLength: number): string {
  if (typeof value !== "string" || value.trim().length === 0) throw new ApiRequestError(`${field} is required.`);
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new ApiRequestError(`${field} is too long.`);
  return normalized;
}

export function optionalString(value: unknown, field: string, maxLength: number): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== "string") throw new ApiRequestError(`${field} must be a string.`);
  const normalized = value.trim();
  if (normalized.length > maxLength) throw new ApiRequestError(`${field} is too long.`);
  return normalized;
}

export function jsonResponseHeaders(): Record<string, string> {
  return { "Cache-Control": "private, no-store, max-age=0", "X-Content-Type-Options": "nosniff" };
}
