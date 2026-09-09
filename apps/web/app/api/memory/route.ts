import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../lib/supabase/server";
export async function POST(request: Request) {
  if (!await getAuthenticatedUser()) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const memory = await request.json();
  return NextResponse.json({ stored: true, memory });
}
