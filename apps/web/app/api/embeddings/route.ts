import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../lib/supabase/server";
export async function POST(request: Request) {
  if (!await getAuthenticatedUser()) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const { chunks } = await request.json();
  return NextResponse.json({ status: "embedding pipeline ready", chunksReceived: chunks?.length ?? 0, vectorStorage: "pending provider connection" });
}
