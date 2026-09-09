import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../../lib/supabase/server";
export async function POST(request: Request) {
  if (!await getAuthenticatedUser()) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const body = await request.json();
  return NextResponse.json({ success: true, document: { name: body.name, status: "queued", pipeline: ["extract","chunk","embed","index"] } });
}
