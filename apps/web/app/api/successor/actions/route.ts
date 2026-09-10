import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "../../../../lib/supabase/server";
import { listSuccessorActions } from "../../../../lib/successor-action-store";
import { updateSuccessorActionState } from "../../../../lib/successor-action-store";
import type { SuccessorActionState } from "../../../../lib/successor-action-types";

const VALID_STATES: SuccessorActionState[] = ["open", "in_progress", "blocked", "complete"];

export async function POST(request: Request) {
  if (!await getAuthenticatedUser()) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  try {
    const body = await request.json() as { actionId?: string; state?: SuccessorActionState; evidenceConfirmed?: boolean; updatedAt?: string };
    if (!body.actionId || !body.state || !VALID_STATES.includes(body.state)) {
      return NextResponse.json({ error: "actionId and a valid state are required." }, { status: 400 });
    }
    const actions = await listSuccessorActions();
    const action = actions.find((item) => item.id === body.actionId);
    if (!action) return NextResponse.json({ error: "Successor action not found." }, { status: 404 });
    const dependenciesComplete = action.dependencies.every((dependencyId) =>
      actions.some((item) => item.id === dependencyId && item.state === "complete")
    );
    if (["in_progress", "complete"].includes(body.state) && !dependenciesComplete) {
      return NextResponse.json({ error: "This action is blocked by an incomplete dependency." }, { status: 409 });
    }
    if (body.state === "complete" && action.evidenceRequired && !body.evidenceConfirmed) {
      return NextResponse.json({ error: "Evidence confirmation is required before completing this action." }, { status: 409 });
    }
    const updated = await updateSuccessorActionState({
      actionId: body.actionId,
      status: body.state,
      evidenceConfirmed: Boolean(body.evidenceConfirmed),
      updatedAt: body.updatedAt ?? action.updatedAt ?? new Date().toISOString(),
    });
    return NextResponse.json({ action: updated });
  } catch {
    return NextResponse.json({ error: "Unable to update successor action." }, { status: 400 });
  }
}
