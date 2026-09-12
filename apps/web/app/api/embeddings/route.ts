import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../lib/supabase/server";
import { ApiRequestError, isRecord, jsonResponseHeaders, parseJsonBody } from "../../../lib/api-request";

const MAX_BODY_BYTES = 256 * 1024;
const MAX_CHUNKS = 500;
const MAX_CHUNK_CHARS = 16_000;

export async function POST(request: Request) {
  if (!await getAuthenticatedUser()) {
    return NextResponse.json({ error: "Authentication is required." }, { status: 401, headers: jsonResponseHeaders() });
  }

  try {
    const body = await parseJsonBody<unknown>(request, MAX_BODY_BYTES);
    if (!isRecord(body) || !Array.isArray(body.chunks)) {
      throw new ApiRequestError("chunks must be an array.");
    }
    if (body.chunks.length > MAX_CHUNKS) throw new ApiRequestError("Too many chunks in one request.");
    for (const chunk of body.chunks) {
      if (typeof chunk !== "string" || chunk.length > MAX_CHUNK_CHARS) {
        throw new ApiRequestError("Each chunk must be a bounded string.");
      }
    }
    return NextResponse.json(
      { status: "embedding pipeline ready", chunksReceived: body.chunks.length, vectorStorage: "pending provider connection" },
      { headers: jsonResponseHeaders() },
    );
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return NextResponse.json({ error: error.message }, { status: error.status, headers: jsonResponseHeaders() });
    }
    return NextResponse.json({ error: "Unable to accept embedding request." }, { status: 500, headers: jsonResponseHeaders() });
  }
}
