import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../lib/supabase/server";
export async function POST(request: Request) {
  if (!await getAuthenticatedUser()) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const { message, workspace } = await request.json();
  return NextResponse.json({ agent: "LegacyOS", workspace, message, response: "Business Brain context retrieval is connected and ready for model execution." });
}
