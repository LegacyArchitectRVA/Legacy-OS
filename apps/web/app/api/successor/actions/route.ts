import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../../lib/supabase/server";
import { transitionSuccessorAction, type SuccessorActionState } from "../../../../lib/successor-actions";
const VALID_STATES: SuccessorActionState[] = ["open","in_progress","blocked","complete"];
export async function POST(request: Request) {
  if (!await getAuthenticatedUser()) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  try {
    const body = await request.json() as { action?: Parameters<typeof transitionSuccessorAction>[0]; state?: SuccessorActionState };
    if (!body.action?.id || !body.state || !VALID_STATES.includes(body.state)) return NextResponse.json({ error: "A valid action and state are required." }, { status: 400 });
    return NextResponse.json({ action: transitionSuccessorAction(body.action, body.state) });
  } catch { return NextResponse.json({ error: "Invalid successor action request." }, { status: 400 }); }
}
