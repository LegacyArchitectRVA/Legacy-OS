import { NextResponse } from "next/server";
import { transitionSuccessorAction, type SuccessorActionState } from "../../../../lib/successor-actions";

const VALID_STATES: SuccessorActionState[] = ["open", "in_progress", "blocked", "complete"];

export async function POST(request: Request) {
  try {
    const body = await request.json() as { action?: Parameters<typeof transitionSuccessorAction>[0]; state?: SuccessorActionState };
    const action = body.action;
    const state = body.state;
    if (!action?.id || !state || !VALID_STATES.includes(state)) {
      return NextResponse.json({ error: "A valid action and state are required." }, { status: 400 });
    }
    return NextResponse.json({ action: transitionSuccessorAction(action, state) });
  } catch {
    return NextResponse.json({ error: "Invalid successor action request." }, { status: 400 });
  }
}
