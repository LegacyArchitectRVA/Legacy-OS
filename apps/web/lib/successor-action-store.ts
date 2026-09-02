import { getRecallUserId } from "./recall-store";
import { getSupabaseServerClient } from "./supabase";
import type { SuccessorAction, SuccessorActionStateRecord } from "./successor-action-types";

const memoryStore = new Map<string, SuccessorAction>();

function mapRow(row: Record<string, unknown>): SuccessorAction {
  return { id: String(row.id), title: String(row.title), domain: String(row.domain), instruction: String(row.instruction), state: row.state as SuccessorAction["state"], evidenceRequired: Boolean(row.evidence_required), evidenceConfirmed: Boolean(row.evidence_confirmed), dependencies: Array.isArray(row.dependencies) ? row.dependencies.filter((v): v is string => typeof v === "string") : [], updatedAt: typeof row.updated_at === "string" ? row.updated_at : undefined };
}

export async function listSuccessorActions(): Promise<SuccessorAction[]> {
  const supabase = await getSupabaseServerClient();
  const userId = await getRecallUserId();
  if (supabase && !userId) throw new Error("Authentication is required for successor workspace.");
  if (supabase && userId) {
    const { data, error } = await supabase.from("legacy_successor_actions").select("id,title,domain,instruction,state,evidence_required,evidence_confirmed,dependencies,updated_at").eq("user_id", userId).order("updated_at", { ascending: false });
    if (error) throw new Error(`Successor action retrieval failed: ${error.message}`);
    return (data ?? []).map(mapRow);
  }
  return [...memoryStore.values()];
}

export async function saveSuccessorAction(action: SuccessorAction): Promise<SuccessorAction> {
  const supabase = await getSupabaseServerClient();
  const userId = await getRecallUserId();
  if (supabase && !userId) throw new Error("Authentication is required for successor action persistence.");
  if (supabase && userId) {
    const { data, error } = await supabase.from("legacy_successor_actions").upsert({ id: action.id, user_id: userId, title: action.title, domain: action.domain, instruction: action.instruction, state: action.state, evidence_required: action.evidenceRequired, evidence_confirmed: Boolean(action.evidenceConfirmed), dependencies: action.dependencies, updated_at: new Date().toISOString() }).select("id,title,domain,instruction,state,evidence_required,evidence_confirmed,dependencies,updated_at").single();
    if (error) throw new Error(`Successor action persistence failed: ${error.message}`);
    return mapRow(data);
  }
  memoryStore.set(action.id, action);
  return action;
}

export async function updateSuccessorActionState(input: SuccessorActionStateRecord): Promise<SuccessorAction> {
  const actions = await listSuccessorActions();
  const action = actions.find((item) => item.id === input.actionId);
  if (!action) throw new Error("Successor action not found.");
  return saveSuccessorAction({ ...action, state: input.status, evidenceConfirmed: input.evidenceConfirmed, updatedAt: input.updatedAt });
}
