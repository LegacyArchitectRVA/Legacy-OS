import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../../lib/request-auth";

const MAX_QUESTION_LENGTH = 10_000;
const MAX_CONTEXT_LENGTH = 50_000;

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const question = typeof body.question === "string" ? body.question.trim() : "";
  const context = typeof body.context === "string" ? body.context.trim() : "";
  if (!question) return NextResponse.json({ error: "question is required." }, { status: 400 });
  if (question.length > MAX_QUESTION_LENGTH) return NextResponse.json({ error: "question exceeds the 10,000 character limit." }, { status: 413 });
  if (context.length > MAX_CONTEXT_LENGTH) return NextResponse.json({ error: "context exceeds the 50,000 character limit." }, { status: 413 });

  return NextResponse.json(
    {
      agent: "Business Brain",
      question,
      context: context || null,
      capabilities: ["SOP retrieval", "process analysis", "template guidance", "operational memory"],
      response: "Knowledge retrieval layer ready for model connection.",
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
