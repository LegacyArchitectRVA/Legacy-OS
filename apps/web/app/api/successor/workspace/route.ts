import { NextResponse } from "next/server";
import { buildSuccessorWorkspace } from "../../../../lib/successor-workspace";
import type { SuccessorAction } from "../../../../lib/successor-action-types";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { actions?: SuccessorAction[] };
    if (!Array.isArray(body.actions)) return NextResponse.json({ error: "actions must be an array." }, { status: 400 });
    return NextResponse.json(buildSuccessorWorkspace(body.actions));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to build successor workspace." }, { status: 400 }); }
}
