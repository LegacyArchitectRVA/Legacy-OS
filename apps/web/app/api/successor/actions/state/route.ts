import { NextResponse } from "next/server";
import { getSuccessorActionState, setSuccessorActionState, type SuccessorActionStatus } from "../../../../../lib/successor-state";

const statuses: SuccessorActionStatus[] = ["open", "in_progress", "blocked", "complete"];

export async function GET(request: Request) {
  const actionId = new URL(request.url).searchParams.get("actionId");
  if (!actionId) return NextResponse.json({ error: "actionId is required." }, { status: 400 });
  try { return NextResponse.json(await getSuccessorActionState(actionId)); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to retrieve action state." }, { status: 500 }); }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { actionId?: string; status?: SuccessorActionStatus; evidenceConfirmed?: boolean; notes?: string };
    if (!body.actionId || !body.status || !statuses.includes(body.status)) return NextResponse.json({ error: "actionId and a valid status are required." }, { status: 400 });
    if (body.status === "complete" && !body.evidenceConfirmed) return NextResponse.json({ error: "Evidence confirmation is required before completing this action." }, { status: 409 });
    return NextResponse.json(await setSuccessorActionState({ actionId: body.actionId, status: body.status, evidenceConfirmed: Boolean(body.evidenceConfirmed), notes: body.notes }));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request body." }, { status: 400 }); }
}
