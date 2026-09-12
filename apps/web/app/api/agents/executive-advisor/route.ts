import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../../lib/supabase/server";
import { ApiRequestError, isRecord, jsonResponseHeaders, optionalString, parseJsonBody, requiredString } from "../../../../lib/api-request";

const MAX_BODY_BYTES = 64 * 1024;
const MAX_CONTEXT_CHARS = 24_000;

export async function POST(request: Request) {
  if (!await getAuthenticatedUser()) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401, headers: jsonResponseHeaders() });
  }

  try {
    const body = await parseJsonBody<unknown>(request, MAX_BODY_BYTES);
    if (!isRecord(body)) throw new ApiRequestError("Request body must be a JSON object.");
    const question = requiredString(body.question, "question", 4_000);
    const businessContext = optionalString(body.businessContext, "businessContext", MAX_CONTEXT_CHARS);
    return NextResponse.json(
      { agent: "Executive Advisor", question, analysis: "Advisor layer initialized.", contextUsed: Boolean(businessContext) },
      { headers: jsonResponseHeaders() },
    );
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: jsonResponseHeaders() });
    }
    return NextResponse.json({ error: "Unable to prepare Executive Advisor request." }, { status: 500, headers: jsonResponseHeaders() });
  }
}
