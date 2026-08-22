import { NextResponse } from "next/server";
import { getSuccessorActionState, setSuccessorActionState, type SuccessorActionStatus } from "../../../../../lib/successor-state";

const statuses: SuccessorActionStatus[] = ["open", "in_progress", "blocked", "complete"];

export async function GET(request: Request) {
  const actionId = new URL(request.url).searchParams.get("actionId");
  if (!actionId) return NextResponse.json({ error: "actionId is required." }, { status: 400 });
  return NextResponse.json(getSuccessorActionState(actionId));
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as { actionId?: string; status?: SuccessorActionStatus; evidenceConfirmed?: boolean; notes?: string };
    if (!body.actionId || !body.status || !statuses.includes(body.status)) return NextResponse.json({ error: "actionId and a valid status are required." }, { status: 400 });
    if (body.status === "complete" && !body.evidenceConfirmed) return NextResponse.json({ error: "Evidence confirmation is required before completing this action." }, { status: 409 });
    return NextResponse.json(setSuccessorActionState({ actionId: body.actionId, status: body.status, evidenceConfirmed: Boolean(body.evidenceConfirmed), notes: body.notes }));
  } catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }
}
