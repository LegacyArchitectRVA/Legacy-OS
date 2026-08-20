import { getSupabaseServerClient } from "./supabase";

export const recallEvidenceTypes = ["document", "photo", "audio", "video", "link", "note"] as const;
export type RecallEvidenceType = (typeof recallEvidenceTypes)[number];
export const recallVerificationStatuses = ["unverified", "verified", "disputed"] as const;
export type RecallVerificationStatus = (typeof recallVerificationStatuses)[number];

export interface RecallEvidenceRecord {
  id: string; memoryId: string; type: RecallEvidenceType; label: string; uri: string;
  description?: string; capturedAt?: string; provenance: Record<string, unknown>;
  verificationStatus: RecallVerificationStatus; createdAt: string;
}

function mapRow(row: Record<string, unknown>): RecallEvidenceRecord {
  return { id: String(row.id), memoryId: String(row.memory_id), type: row.type as RecallEvidenceType, label: String(row.label), uri: String(row.uri), description: typeof row.description === "string" ? row.description : undefined, capturedAt: typeof row.captured_at === "string" ? row.captured_at : undefined, provenance: row.provenance && typeof row.provenance === "object" ? row.provenance as Record<string, unknown> : {}, verificationStatus: (row.verification_status as RecallVerificationStatus) ?? "unverified", createdAt: String(row.created_at) };
}

export async function saveRecallEvidence(evidence: Omit<RecallEvidenceRecord, "id" | "createdAt">, userId: string) {
  const supabase = getSupabaseServerClient(); if (!supabase) throw new Error("Persistent Recall storage is not configured.");
  const { data, error } = await supabase.from("legacy_recall_evidence").insert({ memory_id: evidence.memoryId, user_id: userId, type: evidence.type, label: evidence.label, uri: evidence.uri, description: evidence.description ?? null, captured_at: evidence.capturedAt ?? null, provenance: evidence.provenance ?? {}, verification_status: evidence.verificationStatus ?? "unverified" }).select().single();
  if (error) throw new Error(`Recall evidence persistence failed: ${error.message}`); return mapRow(data);
}

export async function listRecallEvidence(memoryId: string, userId: string) {
  const supabase = getSupabaseServerClient(); if (!supabase) return [];
  const { data, error } = await supabase.from("legacy_recall_evidence").select("*").eq("memory_id", memoryId).eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw new Error(`Recall evidence retrieval failed: ${error.message}`); return (data ?? []).map(mapRow);
}

export async function updateRecallEvidence(id: string, updates: Partial<Pick<RecallEvidenceRecord, "label" | "description" | "capturedAt" | "provenance" | "verificationStatus">>, userId: string) {
  const supabase = getSupabaseServerClient(); if (!supabase) throw new Error("Persistent Recall storage is not configured.");
  const payload: Record<string, unknown> = {};
  if (typeof updates.label === "string") payload.label = updates.label;
  if (typeof updates.description === "string") payload.description = updates.description;
  if (typeof updates.capturedAt === "string") payload.captured_at = updates.capturedAt;
  if (updates.provenance) payload.provenance = updates.provenance;
  if (updates.verificationStatus) payload.verification_status = updates.verificationStatus;
  const { data, error } = await supabase.from("legacy_recall_evidence").update(payload).eq("id", id).eq("user_id", userId).select().maybeSingle();
  if (error) throw new Error(`Recall evidence update failed: ${error.message}`); return data ? mapRow(data) : undefined;
}

export async function deleteRecallEvidence(id: string, userId: string) {
  const supabase = getSupabaseServerClient(); if (!supabase) throw new Error("Persistent Recall storage is not configured.");
  const { data, error } = await supabase.from("legacy_recall_evidence").delete().eq("id", id).eq("user_id", userId).select("id");
  if (error) throw new Error(`Recall evidence deletion failed: ${error.message}`); return Boolean(data?.length);
}
