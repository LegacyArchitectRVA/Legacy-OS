import { NextResponse } from "next/server";
import { getRecallUserId, listRecallMemories } from "../../../lib/recall-store";
import { buildContinuitySnapshot } from "../../../lib/continuity";
import { buildContinuityActions } from "../../../lib/continuity-actions";
import { buildSuccessorBrief } from "../../../lib/successor";

export async function GET() {
  const userId = await getRecallUserId();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  try {
    const memories = await listRecallMemories(undefined, userId);
    const snapshot = buildContinuitySnapshot(memories);
    const actions = buildContinuityActions(snapshot.gaps);
    return NextResponse.json(buildSuccessorBrief(actions, memories, snapshot.readiness));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to build successor brief." }, { status: 500 });
  }
}
