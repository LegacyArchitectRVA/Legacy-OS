import { getRecallUserId } from "./recall-store";
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

export async function getContinuityEngineState() {
  const supabase = await getSupabaseServerClient();
  const userId = await getRecallUserId();
  if (!userId) throw new Error("Authentication is required for continuity readiness.");
  if (!supabase) return { workspaceId: null, pillars: [], readiness: null };

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .select("id")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (workspaceError) throw new Error(`Workspace lookup failed: ${workspaceError.message}`);
  if (!workspace) return { workspaceId: null, pillars: [], readiness: null };

  const [{ data: pillars, error: pillarError }, { data: readiness, error: readinessError }] = await Promise.all([
    supabase.from("continuity_pillars").select("id,workspace_id,pillar_key,name,description,weight,coverage_score,status,updated_at").eq("workspace_id", workspace.id).order("created_at", { ascending: true }),
    supabase.from("continuity_readiness").select("workspace_id,overall_score,pillar_count,ready_count,in_progress_count,needs_attention_count,last_updated").eq("workspace_id", workspace.id).maybeSingle(),
  ]);
  if (pillarError) throw new Error(`Continuity pillar retrieval failed: ${pillarError.message}`);
  if (readinessError) throw new Error(`Continuity readiness retrieval failed: ${readinessError.message}`);
  return { workspaceId: workspace.id, pillars: pillars ?? [], readiness: readiness ?? null };
}

export async function updateContinuityPillar(pillarKey: string, coverageScore: number, status: string) {
  const supabase = await getSupabaseServerClient();
  const userId = await getRecallUserId();
  if (!supabase || !userId) throw new Error("Authentication and a workspace are required.");
  if (!Number.isInteger(coverageScore) || coverageScore < 0 || coverageScore > 100) throw new Error("Coverage score must be 0-100.");
  if (!["needs_attention", "in_progress", "ready"].includes(status)) throw new Error("Invalid continuity status.");

  const { data: workspace } = await supabase.from("workspaces").select("id").eq("owner_id", userId).order("created_at", { ascending: true }).limit(1).maybeSingle();
  if (!workspace) throw new Error("Workspace not found.");
  const { data, error } = await supabase.from("continuity_pillars").update({ coverage_score: coverageScore, status, updated_at: new Date().toISOString() }).eq("workspace_id", workspace.id).eq("pillar_key", pillarKey).select("*").single();
  if (error) throw new Error(`Continuity pillar update failed: ${error.message}`);
  return data;
}
