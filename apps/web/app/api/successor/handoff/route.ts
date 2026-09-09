import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../../lib/supabase/server";
import { listSuccessorActions } from "../../../../lib/successor-action-store";
import { buildSuccessorHandoff } from "../../../../lib/successor-handoff";
export async function GET() {
  if (!await getAuthenticatedUser()) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  try { return NextResponse.json(buildSuccessorHandoff(await listSuccessorActions())); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load successor handoff." }, { status: 500 }); }
}
