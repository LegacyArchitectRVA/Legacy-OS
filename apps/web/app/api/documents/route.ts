import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../lib/request-auth";

const MAX_NAME_LENGTH = 256;
const MAX_TYPE_LENGTH = 128;
const MAX_CONTENT_LENGTH = 1_000_000;

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const type = typeof body.type === "string" ? body.type.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";

  if (!name || name.length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: `name is required and must be ${MAX_NAME_LENGTH} characters or fewer.` }, { status: 400 });
  }
  if (!type || type.length > MAX_TYPE_LENGTH) {
    return NextResponse.json({ error: `type is required and must be ${MAX_TYPE_LENGTH} characters or fewer.` }, { status: 400 });
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    return NextResponse.json({ error: "content exceeds the 1 MB request limit." }, { status: 413 });
  }

  return NextResponse.json(
    {
      document: {
        name,
        type,
        status: "queued",
        extracted: Boolean(content),
      },
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
