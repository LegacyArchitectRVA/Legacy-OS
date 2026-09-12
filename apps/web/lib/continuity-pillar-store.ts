import { buildContinuityActions } from "./continuity-actions";
import { buildContinuityPillarCoverage, buildContinuitySnapshot } from "./continuity";
import { getRecallUserId, listRecallMemories } from "./recall-store";
import { getSupabaseServerClient } from "./supabase/server";

export const CONTINUITY_PILLARS = [
  ["digital_life", "Digital Life"],
  ["financial_assets", "Financial & Assets"],
  ["household_property", "Household & Property"],
  ["health_medical", "Health & Medical"],
  ["vital_records", "Vital Records"],
  ["business_continuity", "Business Continuity"],
  ["legacy_wishes", "Legacy & Wishes"],
] as const;

type ContinuityPillarKey = (typeof CONTINUITY_PILLARS)[number][0];

function isContinuityPillarKey(value: string): value is ContinuityPillarKey {
  return CONTINUITY_PILLARS.some(([key]) => key === value);
}

async function getOwnedWorkspace(
  supabase: NonNullable<Awaited<ReturnType<typeof getSupabaseServerClient>>>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error("Unable to resolve the current workspace.");
  return data;
}

export async function getContinuityEngineState() {
  const supabase = await getSupabaseServerClient();
  const userId = await getRecallUserId();
  if (!userId) throw new Error("Authentication is required for continuity readiness.");
  if (!supabase) return { workspaceId: null, pillars: [], readiness: null, actions: [], snapshot: null };

  const workspace = await getOwnedWorkspace(supabase, userId);
  if (!workspace) return { workspaceId: null, pillars: [], readiness: null, actions: [], snapshot: null };

  const [{ data: pillars, error: pillarError }, { data: readiness, error: readinessError }, memories] = await Promise.all([
    supabase.from("continuity_pillars").select("id,workspace_id,pillar_key,name,description,weight,coverage_score,status,updated_at").eq("workspace_id", workspace.id).order("created_at", { ascending: true }),
    supabase.from("continuity_readiness").select("workspace_id,overall_score,pillar_count,ready_count,in_progress_count,needs_attention_count,last_updated").eq("workspace_id", workspace.id).maybeSingle(),
    listRecallMemories(undefined, userId),
  ]);
  if (pillarError) throw new Error("Unable to retrieve continuity pillars.");
  if (readinessError) throw new Error("Unable to retrieve continuity readiness.");

  const snapshot = buildContinuitySnapshot(memories);
  const computedPillars = buildContinuityPillarCoverage(memories);
  const computedByKey = new Map(computedPillars.map((pillar) => [pillar.pillarKey, pillar]));
  const mergedPillars = (pillars ?? []).map((pillar) => {
    const computed = computedByKey.get(pillar.pillar_key as ContinuityPillarKey);
    return computed ? { ...pillar, coverage_score: computed.coverageScore, status: computed.status, matched_memories: computed.matchedMemories } : pillar;
  });
  const actions = buildContinuityActions(snapshot.gaps);
  const computedReadiness = {
    workspace_id: workspace.id,
    overall_score: computedPillars.length ? Math.round(computedPillars.reduce((sum, pillar) => sum + pillar.coverageScore, 0) / computedPillars.length) : 0,
    pillar_count: computedPillars.length,
    ready_count: computedPillars.filter((pillar) => pillar.status === "ready").length,
    in_progress_count: computedPillars.filter((pillar) => pillar.status === "in_progress").length,
    needs_attention_count: computedPillars.filter((pillar) => pillar.status === "needs_attention").length,
    last_updated: readiness?.last_updated ?? null,
  };

  return { workspaceId: workspace.id, pillars: mergedPillars, readiness: computedReadiness, actions, snapshot };
}

export async function refreshContinuityPillars() {
  const supabase = await getSupabaseServerClient();
  const userId = await getRecallUserId();
  if (!supabase || !userId) throw new Error("Authentication and a workspace are required.");
  const workspace = await getOwnedWorkspace(supabase, userId);
  if (!workspace) throw new Error("Workspace not found.");

  const memories = await listRecallMemories(undefined, userId);
  const computed = buildContinuityPillarCoverage(memories);
  const now = new Date().toISOString();
  for (const pillar of computed) {
    const { error } = await supabase
      .from("continuity_pillars")
      .update({ coverage_score: pillar.coverageScore, status: pillar.status, updated_at: now })
      .eq("workspace_id", workspace.id)
      .eq("pillar_key", pillar.pillarKey);
    if (error) throw new Error("Unable to refresh continuity pillars.");
  }
  return getContinuityEngineState();
}

export async function updateContinuityPillar(pillarKey: string, coverageScore: number, status: string) {
  const supabase = await getSupabaseServerClient();
  const userId = await getRecallUserId();
  if (!supabase || !userId) throw new Error("Authentication and a workspace are required.");
  if (!isContinuityPillarKey(pillarKey)) throw new Error("Invalid continuity pillar.");
  if (!Number.isInteger(coverageScore) || coverageScore < 0 || coverageScore > 100) throw new Error("Coverage score must be 0-100.");
  if (!["needs_attention", "in_progress", "ready"].includes(status)) throw new Error("Invalid continuity status.");

  const workspace = await getOwnedWorkspace(supabase, userId);
  if (!workspace) throw new Error("Workspace not found.");
  const { data, error } = await supabase
    .from("continuity_pillars")
    .update({ coverage_score: coverageScore, status, updated_at: new Date().toISOString() })
    .eq("workspace_id", workspace.id)
    .eq("pillar_key", pillarKey)
    .select("*")
    .maybeSingle();
  if (error) throw new Error("Unable to update continuity pillar.");
  if (!data) throw new Error("Continuity pillar not found.");
  return data;
}
