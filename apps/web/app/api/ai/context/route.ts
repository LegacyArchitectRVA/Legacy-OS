import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../../lib/supabase/server";
export async function POST(request: Request) {
  if (!await getAuthenticatedUser()) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const { query, context } = await request.json();
  return NextResponse.json({ query, context, response: "LegacyOS context engine ready for model connection." });
}
