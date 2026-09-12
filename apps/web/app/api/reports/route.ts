import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../lib/supabase/server";
import { ApiRequestError, isRecord, jsonResponseHeaders, optionalString, parseJsonBody } from "../../../lib/api-request";

const MAX_BODY_BYTES = 16 * 1024;

export async function POST(request: Request) {
  if (!await getAuthenticatedUser()) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401, headers: jsonResponseHeaders() });
  }

  try {
    const body = await parseJsonBody<unknown>(request, MAX_BODY_BYTES);
    if (!isRecord(body)) throw new ApiRequestError("Request body must be a JSON object.");
    const workspace = optionalString(body.workspace, "workspace", 160);
    return NextResponse.json(
      { report: "LegacyOS weekly intelligence report", workspace: workspace ?? null, sections: ["changes", "risks", "recommendations"] },
      { headers: jsonResponseHeaders() },
    );
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: jsonResponseHeaders() });
    }
    return NextResponse.json({ error: "Unable to prepare report." }, { status: 500, headers: jsonResponseHeaders() });
  }
}
