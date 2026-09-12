import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../../lib/supabase/server";
import { ApiRequestError, isRecord, jsonResponseHeaders, optionalString, parseJsonBody } from "../../../../lib/api-request";

const MAX_BODY_BYTES = 64 * 1024;
const MAX_CONTEXT_CHARS = 24_000;

export async function POST(request: Request) {
  if (!await getAuthenticatedUser()) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401, headers: jsonResponseHeaders() });
  }

  try {
    const body = await parseJsonBody<unknown>(request, MAX_BODY_BYTES);
    if (!isRecord(body)) throw new ApiRequestError("Request body must be a JSON object.");
    const query = optionalString(body.query, "query", 4_000);
    const context = optionalString(body.context, "context", MAX_CONTEXT_CHARS);
    if (!query && !context) throw new ApiRequestError("query or context is required.");
    return NextResponse.json(
      { query: query ?? null, contextAccepted: Boolean(context), response: "LegacyOS context engine ready for model connection." },
      { headers: jsonResponseHeaders() },
    );
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: jsonResponseHeaders() });
    }
    return NextResponse.json({ error: "Unable to prepare context." }, { status: 500, headers: jsonResponseHeaders() });
  }
}
