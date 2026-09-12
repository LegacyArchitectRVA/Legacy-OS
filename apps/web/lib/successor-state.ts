import { getRecallUserId } from "./recall-store";
import { getSupabaseServerClient } from "./supabase";
import type { SuccessorActionState, SuccessorActionStateRecord } from "./successor-action-types";

const memory = new Map<string, SuccessorActionStateRecord>();
function mapRow(row: Record<string, unknown>): SuccessorActionStateRecord {
  return {
    actionId: String(row.id),
    status: row.state as SuccessorActionState,
    updatedAt: String(row.updated_at),
    evidenceConfirmed: Boolean(row.evidence_confirmed),
    notes: typeof row.notes === "string" ? row.notes : undefined,
  };
}

export async function getSuccessorActionState(actionId: string): Promise<SuccessorActionStateRecord> {
  const supabase = getSupabaseServerClient();
  const userId = await getRecallUserId();
  if (supabase && !userId) throw new Error("Authentication is required for successor action state.");
  if (supabase && userId) {
    const { data, error } = await supabase
      .from("legacy_successor_actions")
      .select("id,state,updated_at,evidence_confirmed,notes")
      .eq("id", actionId)
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new Error(`Successor action retrieval failed: ${error.message}`);
    if (data) return mapRow(data);
  }
  return memory.get(actionId) ?? { actionId, status: "open", updatedAt: new Date().toISOString(), evidenceConfirmed: false };
}

export async function setSuccessorActionState(input: Omit<SuccessorActionStateRecord, "updatedAt">): Promise<SuccessorActionStateRecord> {
  const supabase = getSupabaseServerClient();
  const userId = await getRecallUserId();
  if (supabase && !userId) throw new Error("Authentication is required for successor action state.");

  if (supabase && userId) {
    const { data: current, error: currentError } = await supabase
      .from("legacy_successor_actions")
      .select("id,state,evidence_required,evidence_confirmed,dependencies,notes")
      .eq("id", input.actionId)
      .eq("user_id", userId)
      .maybeSingle();
    if (currentError) throw new Error(`Successor action retrieval failed: ${currentError.message}`);
    if (!current) throw new Error("Successor action not found.");

    const { data: actions, error: actionsError } = await supabase
      .from("legacy_successor_actions")
      .select("id,state,dependencies")
      .eq("user_id", userId);
    if (actionsError) throw new Error(`Successor action dependency retrieval failed: ${actionsError.message}`);

    const executable = input.status === "in_progress" || input.status === "complete";
    if (executable && current.state === "blocked") {
      throw new Error("This action is explicitly blocked and cannot be started or completed until it is unblocked.");
    }

    const dependencies = Array.isArray(current.dependencies)
      ? current.dependencies.filter((value): value is string => typeof value === "string")
      : [];
    const dependencyRows = actions ?? [];
    if (executable && !dependencies.every((id) => dependencyRows.some((row) => row.id === id && row.state === "complete"))) {
      throw new Error("This action is blocked by an incomplete dependency.");
    }

    if (input.status !== "complete" && current.state === "complete") {
      const hasCompletedDownstream = dependencyRows.some((row) => {
        if (row.state !== "complete" || !Array.isArray(row.dependencies)) return false;
        return row.dependencies.includes(input.actionId);
      });
      if (hasCompletedDownstream) {
        throw new Error("This action cannot leave complete state while a dependent action is already complete.");
      }
    }

    let evidenceConfirmed = Boolean(input.evidenceConfirmed) || Boolean(current.evidence_confirmed);
    if (input.status === "complete" && current.evidence_required && !evidenceConfirmed) {
      const { count, error: clipError } = await supabase
        .from("legacy_os_clips")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("successor_action_id", input.actionId);
      if (clipError) throw new Error(`Successor evidence retrieval failed: ${clipError.message}`);
      evidenceConfirmed = (count ?? 0) > 0;
      if (!evidenceConfirmed) throw new Error("Evidence confirmation or a linked evidence clip is required before completing this action.");
    }

    const { data, error } = await supabase
      .from("legacy_successor_actions")
      .update({
        state: input.status,
        evidence_confirmed: evidenceConfirmed,
        notes: input.notes ?? (typeof current.notes === "string" ? current.notes : null),
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.actionId)
      .eq("user_id", userId)
      .select("id,state,updated_at,evidence_confirmed,notes")
      .maybeSingle();
    if (error) throw new Error(`Successor action update failed: ${error.message}`);
    if (data) return mapRow(data);
    throw new Error("Successor action update did not modify the requested action.");
  }

  const existing = memory.get(input.actionId);
  if (input.status === "in_progress" || input.status === "complete") {
    if (existing?.status === "blocked") throw new Error("This action is explicitly blocked and cannot be started or completed until it is unblocked.");
    if (input.status === "complete" && !input.evidenceConfirmed && existing?.evidenceConfirmed !== true) {
      throw new Error("Evidence confirmation is required before completing this action.");
    }
  }
  if (input.status !== "complete" && existing?.status === "complete") {
    throw new Error("This action cannot leave complete state without persisted dependency context.");
  }
  const state = {
    ...input,
    evidenceConfirmed: Boolean(input.evidenceConfirmed) || Boolean(existing?.evidenceConfirmed),
    notes: input.notes ?? existing?.notes,
    updatedAt: new Date().toISOString(),
  };
  memory.set(input.actionId, state);
  return state;
}
