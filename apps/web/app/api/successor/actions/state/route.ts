import { NextResponse } from "next/server";
import { getSuccessorActionState, setSuccessorActionState } from "../../../../../lib/successor-state";
import { listSuccessorActions } from "../../../../../lib/successor-action-store";
import type { SuccessorActionState } from "../../../../../lib/successor-action-types";

const statuses: SuccessorActionState[] = ["open", "in_progress", "blocked", "complete"];

export async function GET(request: Request) {
  const actionId = new URL(request.url).searchParams.get("actionId");
  if (!actionId) return NextResponse.json({ error: "actionId is required." }, { status: 400 });
  try { return NextResponse.json(await getSuccessorActionState(actionId)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to retrieve action state." }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { actionId?: string; status?: SuccessorActionState; evidenceConfirmed?: boolean; notes?: string };
    if (!body.actionId || !body.status || !statuses.includes(body.status)) return NextResponse.json({ error: "actionId and a valid status are required." }, { status: 400 });
    const actions = await listSuccessorActions();
    const action = actions.find((item) => item.id === body.actionId);
    if (!action) return NextResponse.json({ error: "Successor action not found." }, { status: 404 });
    const dependenciesComplete = action.dependencies.every((dependencyId) => actions.some((item) => item.id === dependencyId && item.state === "complete"));
    if (["in_progress", "complete"].includes(body.status) && !dependenciesComplete) return NextResponse.json({ error: "This action is blocked by an incomplete dependency." }, { status: 409 });
    if (body.status === "complete" && action.evidenceRequired && !body.evidenceConfirmed) return NextResponse.json({ error: "Evidence confirmation is required before completing this action." }, { status: 409 });
    return NextResponse.json(await setSuccessorActionState({ actionId: body.actionId, status: body.status, evidenceConfirmed: Boolean(body.evidenceConfirmed), notes: body.notes }));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request body." }, { status: 400 }); }
}
