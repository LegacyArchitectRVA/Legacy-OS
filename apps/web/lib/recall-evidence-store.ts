import { getSupabaseServerClient } from "./supabase";

export const recallEvidenceTypes = ["document", "photo", "audio", "video", "link", "note"] as const;
export type RecallEvidenceType = (typeof recallEvidenceTypes)[number];

export interface RecallEvidenceRecord {
  id: string;
  memoryId: string;
  type: RecallEvidenceType;
  label: string;
  uri: string;
  description?: string;
  capturedAt?: string;
  createdAt: string;
}

function mapRow(row: Record<string, unknown>): RecallEvidenceRecord {
  return {
    id: String(row.id),
    memoryId: String(row.memory_id),
    type: row.type as RecallEvidenceType,
    label: String(row.label),
    uri: String(row.uri),
    description: typeof row.description === "string" ? row.description : undefined,
    capturedAt: typeof row.captured_at === "string" ? row.captured_at : undefined,
    createdAt: String(row.created_at),
  };
}

export async function saveRecallEvidence(
  evidence: Omit<RecallEvidenceRecord, "id" | "createdAt">,
  userId: string,
): Promise<RecallEvidenceRecord> {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error("Persistent Recall storage is not configured.");
  const { data, error } = await supabase
    .from("legacy_recall_evidence")
    .insert({
      memory_id: evidence.memoryId,
      user_id: userId,
      type: evidence.type,
      label: evidence.label,
      uri: evidence.uri,
      description: evidence.description ?? null,
      captured_at: evidence.capturedAt ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(`Recall evidence persistence failed: ${error.message}`);
  return mapRow(data);
}

export async function listRecallEvidence(memoryId: string, userId: string): Promise<RecallEvidenceRecord[]> {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("legacy_recall_evidence")
    .select("*")
    .eq("memory_id", memoryId)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(`Recall evidence retrieval failed: ${error.message}`);
  return (data ?? []).map((row) => mapRow(row));
}
