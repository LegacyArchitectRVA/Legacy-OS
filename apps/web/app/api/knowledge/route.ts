import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../lib/request-auth";

const MAX_BODY_BYTES = 1_000_000;

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Request exceeds the 1 MB limit." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  return NextResponse.json(
    { status: "received", knowledgeItem: body },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
