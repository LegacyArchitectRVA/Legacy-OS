import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../lib/supabase/server";
import { ApiRequestError, isRecord, jsonResponseHeaders, parseJsonBody, requiredString } from "../../lib/api-request";

const MAX_BODY_BYTES = 16 * 1024;

export async function POST(request: Request) {
  if (!await getAuthenticatedUser()) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401, headers: jsonResponseHeaders() });
  }

  try {
    const body = await parseJsonBody<unknown>(request, MAX_BODY_BYTES);
    if (!isRecord(body)) throw new ApiRequestError("Request body must be a JSON object.");
    const query = requiredString(body.query, "query", 512);
    return NextResponse.json(
      { query, results: [], status: "vector search ready" },
      { headers: jsonResponseHeaders() },
    );
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: jsonResponseHeaders() });
    }
    return NextResponse.json({ error: "Unable to process search." }, { status: 500, headers: jsonResponseHeaders() });
  }
}
