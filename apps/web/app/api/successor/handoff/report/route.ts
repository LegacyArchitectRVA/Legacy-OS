import { NextResponse } from "next/server";
import { listSuccessorActions } from "../../../../../lib/successor-action-store";
import { buildSuccessorHandoff } from "../../../../../lib/successor-handoff";
import { buildSuccessorHandoffReport } from "../../../../../lib/successor-handoff-report";

export async function GET() {
  try {
    const actions = await listSuccessorActions();
    const handoff = buildSuccessorHandoff(actions);
    return NextResponse.json(buildSuccessorHandoffReport(handoff, actions));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load successor handoff report." }, { status: 500 });
  }
}
