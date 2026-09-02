import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../lib/request-auth";

const MAX_CHUNKS = 100;
const MAX_CHUNK_LENGTH = 20_000;

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const chunks = body.chunks;
  if (!Array.isArray(chunks)) return NextResponse.json({ error: "chunks must be an array." }, { status: 400 });
  if (chunks.length > MAX_CHUNKS) return NextResponse.json({ error: `A maximum of ${MAX_CHUNKS} chunks is allowed per request.` }, { status: 413 });
  if (chunks.some((chunk) => typeof chunk !== "string" || chunk.length > MAX_CHUNK_LENGTH)) {
    return NextResponse.json({ error: `Each chunk must be a string of ${MAX_CHUNK_LENGTH} characters or fewer.` }, { status: 400 });
  }

  return NextResponse.json(
    {
      status: "embedding pipeline ready",
      chunksReceived: chunks.length,
      vectorStorage: "pending provider connection",
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
