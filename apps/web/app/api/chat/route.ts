import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../lib/request-auth";

const MAX_MESSAGE_LENGTH = 10_000;
const MAX_WORKSPACE_LENGTH = 256;

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const message = typeof body.message === "string" ? body.message.trim() : "";
  const workspace = typeof body.workspace === "string" ? body.workspace.trim() : "";

  if (!message) return NextResponse.json({ error: "message is required." }, { status: 400 });
  if (message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json({ error: `message must be ${MAX_MESSAGE_LENGTH} characters or fewer.` }, { status: 413 });
  }
  if (workspace.length > MAX_WORKSPACE_LENGTH) {
    return NextResponse.json({ error: `workspace must be ${MAX_WORKSPACE_LENGTH} characters or fewer.` }, { status: 400 });
  }

  return NextResponse.json(
    {
      agent: "LegacyOS",
      workspace: workspace || null,
      message,
      response: "Business Brain context retrieval is connected and ready for model execution.",
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
