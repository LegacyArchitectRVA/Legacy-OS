import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../lib/supabase/server";
import { ApiRequestError, isRecord, jsonResponseHeaders, optionalString, parseJsonBody } from "../../lib/api-request";

const MAX_BODY_BYTES = 64 * 1024;
const MAX_TEXT_CHARS = 16_000;

export async function POST(request: Request) {
  if (!await getAuthenticatedUser()) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401, headers: jsonResponseHeaders() });
  }

  try {
    const body = await parseJsonBody<unknown>(request, MAX_BODY_BYTES);
    if (!isRecord(body)) throw new ApiRequestError("Request body must be a JSON object.");
    const title = optionalString(body.title, "title", 160);
    const narrative = optionalString(body.narrative, "narrative", MAX_TEXT_CHARS);
    if (!title && !narrative) throw new ApiRequestError("title or narrative is required.");
    return NextResponse.json(
      { status: "received", knowledgeItem: { title: title ?? null, narrative: narrative ?? null } },
      { headers: jsonResponseHeaders() },
    );
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: jsonResponseHeaders() });
    }
    return NextResponse.json({ error: "Unable to accept knowledge item." }, { status: 500, headers: jsonResponseHeaders() });
  }
}
