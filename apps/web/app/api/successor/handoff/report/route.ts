import { NextResponse } from "next/server";
import { listSuccessorActions } from "../../../../../lib/successor-action-store";
import { buildSuccessorHandoff } from "../../../../../lib/successor-handoff";
import { buildSuccessorHandoffReport } from "../../../../../lib/successor-handoff-report";
import { getAuthenticatedUser } from "../../../../../lib/supabase/server";

export async function GET() {
  if (!await getAuthenticatedUser()) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  try {
    const actions = await listSuccessorActions();
    const handoff = buildSuccessorHandoff(actions);
    return NextResponse.json(buildSuccessorHandoffReport(handoff, actions));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load successor handoff report." }, { status: 500 });
  }
}
