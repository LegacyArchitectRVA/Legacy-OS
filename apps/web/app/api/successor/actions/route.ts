import { NextResponse } from "next/server";
import { transitionSuccessorAction, type SuccessorActionState } from "../../../lib/successor-actions";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const action = body?.action;
    const state = body?.state as SuccessorActionState;
    if (!action?.id || !["open", "in_progress", "blocked", "complete"].includes(state)) return NextResponse.json({ error: "A valid action and state are required." }, { status: 400 });
    return NextResponse.json({ action: transitionSuccessorAction(action, state) });
  } catch { return NextResponse.json({ error: "Invalid successor action request." }, { status: 400 }); }
}
