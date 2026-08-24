import { NextResponse } from "next/server";
import { listSuccessorActions } from "../../../../lib/successor-action-store";
import { buildSuccessorHandoff } from "../../../../lib/successor-handoff";

export async function GET() {
  try { return NextResponse.json(buildSuccessorHandoff(await listSuccessorActions())); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load successor handoff." }, { status: 500 }); }
}
