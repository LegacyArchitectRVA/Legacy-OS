import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../../lib/supabase/server";
export async function POST(request: Request) {
  if (!await getAuthenticatedUser()) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const { question, context } = await request.json();
  return NextResponse.json({ agent: "Business Brain", question, context, capabilities: ["SOP retrieval","process analysis","template guidance","operational memory"], response: "Knowledge retrieval layer ready for model connection." });
}
