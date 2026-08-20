import { NextResponse } from "next/server";
import { getRecallUserId, listRecallMemories } from "../../../../lib/recall-store";
import { findRecallConflicts, findRecallRelationships } from "../../../../lib/recall-relationships";

export async function GET(request: Request) {
  const userId = await getRecallUserId();
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && !userId) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });
  const context = new URL(request.url).searchParams.get("context");
  try {
    const memories = await listRecallMemories(context === "personal" || context === "family" || context === "business" ? context : undefined, userId);
    return NextResponse.json({ relationships: findRecallRelationships(memories), conflicts: findRecallConflicts(memories) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to analyze Recall memories." }, { status: 500 });
  }
}
