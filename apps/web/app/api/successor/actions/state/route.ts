import { NextResponse } from "next/server";
import { getSuccessorActionState, setSuccessorActionState } from "../../../../../lib/successor-state";
import { listSuccessorActions } from "../../../../../lib/successor-action-store";
import type { SuccessorActionState } from "../../../../../lib/successor-action-types";
import { getAuthenticatedUser, getSupabaseServerClient } from "../../../../../lib/supabase/server";

const statuses: SuccessorActionState[] = ["open", "in_progress", "blocked", "complete"];
const executableStatuses: SuccessorActionState[] = ["in_progress", "complete"];

export async function GET(request: Request) {
  if (!await getAuthenticatedUser()) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const actionId = new URL(request.url).searchParams.get("actionId");
  if (!actionId) return NextResponse.json({ error: "actionId is required." }, { status: 400 });
  try { return NextResponse.json(await getSuccessorActionState(actionId)); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to retrieve action state." }, { status: 500 }); }
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  try {
    const body = await request.json() as { actionId?: string; status?: SuccessorActionState; evidenceConfirmed?: boolean; notes?: string };
    if (!body.actionId || !body.status || !statuses.includes(body.status)) return NextResponse.json({ error: "actionId and a valid status are required." }, { status: 400 });

    const actions = await listSuccessorActions();
    const action = actions.find((item) => item.id === body.actionId);
    if (!action) return NextResponse.json({ error: "Successor action not found." }, { status: 404 });

    if (executableStatuses.includes(body.status) && action.state === "blocked") {
      return NextResponse.json({ error: "This action is explicitly blocked and cannot be started or completed until it is unblocked." }, { status: 409 });
    }

    const dependenciesComplete = action.dependencies.every((dependencyId) =>
      actions.some((item) => item.id === dependencyId && item.state === "complete"),
    );
    if (executableStatuses.includes(body.status) && !dependenciesComplete) {
      return NextResponse.json({ error: "This action is blocked by an incomplete dependency." }, { status: 409 });
    }

    let evidenceConfirmed = Boolean(body.evidenceConfirmed) || Boolean(action.evidenceConfirmed);
    if (body.status === "complete" && action.evidenceRequired && !evidenceConfirmed) {
      const supabase = await getSupabaseServerClient();
      const { count, error } = supabase
        ? await supabase.from("legacy_os_clips").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("successor_action_id", action.id)
        : { count: null, error: new Error("Unable to initialize database client.") };
      if (error) throw error;
      evidenceConfirmed = (count ?? 0) > 0;
      if (!evidenceConfirmed) {
        return NextResponse.json({ error: "Evidence confirmation or a linked evidence clip is required before completing this action." }, { status: 409 });
      }
    }

    return NextResponse.json(await setSuccessorActionState({ actionId: body.actionId, status: body.status, evidenceConfirmed, notes: body.notes }));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Invalid request body." }, { status: 400 }); }
}
