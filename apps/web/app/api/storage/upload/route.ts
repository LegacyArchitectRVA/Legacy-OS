import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../../lib/supabase/server";

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const body = await request.json();
  return NextResponse.json({ success: true, file: body.file ?? null, status: "queued", pipeline: ["extract", "chunk", "embed", "index"] });
}
