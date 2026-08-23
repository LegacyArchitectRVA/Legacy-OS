import { NextResponse } from "next/server";
import { buildSuccessorWorkspace } from "../../../../lib/successor-workspace";
import { listSuccessorActions } from "../../../../lib/successor-action-store";
import { summarizeSuccessorActions } from "../../../../lib/successor-workspace-model";
import type { SuccessorAction } from "../../../../lib/successor-action-types";

export async function GET() {
  try { const workspace = buildSuccessorWorkspace(await listSuccessorActions()); return NextResponse.json({ ...workspace, summary: summarizeSuccessorActions(workspace.actions) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load successor workspace." }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { actions?: SuccessorAction[] };
    if (!Array.isArray(body.actions)) return NextResponse.json({ error: "actions must be an array." }, { status: 400 });
    const workspace = buildSuccessorWorkspace(body.actions);
    return NextResponse.json({ ...workspace, summary: summarizeSuccessorActions(workspace.actions) });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to build successor workspace." }, { status: 400 }); }
}
