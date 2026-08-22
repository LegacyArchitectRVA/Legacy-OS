import { NextResponse } from "next/server";
import { getRecallUserId, listRecallMemories } from "../../../../lib/recall-store";
import { buildContinuitySnapshot } from "../../../../lib/continuity";
import { buildContinuityActions } from "../../../../lib/continuity-actions";

export async function GET() {
  const userId = await getRecallUserId();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  try { const memories = await listRecallMemories(undefined, userId); const snapshot = buildContinuitySnapshot(memories); return NextResponse.json({ actions: buildContinuityActions(snapshot.gaps) }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to build continuity actions." }, { status: 500 }); }
}
