import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSupabaseServerClient } from "../../../../lib/supabase/server";
import { listSuccessorActions } from "../../../../lib/successor-action-store";
import { buildSuccessorHandoff } from "../../../../lib/successor-handoff";

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  try {
    const handoff = buildSuccessorHandoff(await listSuccessorActions());
    const supabase = await getSupabaseServerClient();
    const { data: clips, error } = supabase
      ? await supabase.from("legacy_os_clips").select("id,successor_action_id").eq("user_id", user.id).not("successor_action_id", "is", null)
      : { data: null, error: new Error("Unable to initialize database client.") };

    if (error) throw error;

    const evidenceClipCounts: Record<string, number> = {};
    for (const clip of clips ?? []) {
      if (!clip.successor_action_id) continue;
      evidenceClipCounts[clip.successor_action_id] = (evidenceClipCounts[clip.successor_action_id] ?? 0) + 1;
    }

    const actionReadiness = handoff.actionReadiness.map((readiness) => {
      const clipEvidence = evidenceClipCounts[readiness.actionId] ?? 0;
      const evidenceConfirmed = readiness.evidenceConfirmed || clipEvidence > 0;
      return {
        ...readiness,
        evidenceConfirmed,
        ready: readiness.ready || (readiness.evidenceRequired && evidenceConfirmed && readiness.unresolvedDependencies.length === 0),
        evidenceClipCount: clipEvidence,
      };
    });

    return NextResponse.json({ ...handoff, actionReadiness, evidenceClipCounts });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to load successor handoff." }, { status: 500 });
  }
}
