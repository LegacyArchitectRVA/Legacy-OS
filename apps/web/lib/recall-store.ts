import type { RecallContext, RecallMemoryRecord } from "./recall";
import { getSupabaseServerClient } from "./supabase";

const memoryStore: RecallMemoryRecord[] = [];

export async function getRecallUserId() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

function mapRow(row: Record<string, unknown>): RecallMemoryRecord {
  return {
    id: String(row.id),
    context: row.context as RecallContext,
    title: String(row.title),
    narrative: String(row.narrative),
    occurredAt: typeof row.occurred_at === "string" ? row.occurred_at : undefined,
    people: Array.isArray(row.people) ? row.people.filter((v): v is string => typeof v === "string") : [],
    sourceRefs: Array.isArray(row.source_refs) ? row.source_refs.filter((v): v is string => typeof v === "string") : [],
    evidenceClass: row.evidence_class as RecallMemoryRecord["evidenceClass"],
    confidence: typeof row.confidence === "number" ? row.confidence : undefined,
    createdAt: String(row.created_at),
    provenanceComplete: Boolean(row.provenance_complete),
  };
}

export async function saveRecallMemory(memory: RecallMemoryRecord, userId?: string | null): Promise<RecallMemoryRecord> {
  const supabase = await getSupabaseServerClient();
  if (supabase && !userId) throw new Error("Authentication is required for persistent Recall storage.");
  if (supabase && userId) {
    const { data, error } = await supabase.from("legacy_recall_memories").insert({
      user_id: userId,
      context: memory.context,
      title: memory.title,
      narrative: memory.narrative,
      occurred_at: memory.occurredAt ?? null,
      people: memory.people ?? [],
      source_refs: memory.sourceRefs ?? [],
      evidence_class: memory.evidenceClass,
      confidence: memory.confidence ?? null,
      provenance_complete: memory.provenanceComplete,
    }).select().single();
    if (error) throw new Error(`Recall persistence failed: ${error.message}`);
    return mapRow(data);
  }
  memoryStore.push(memory);
  return memory;
}

export async function listRecallMemories(context?: RecallContext, userId?: string | null, search?: string): Promise<RecallMemoryRecord[]> {
  const supabase = await getSupabaseServerClient();
  if (supabase && !userId) throw new Error("Authentication is required for persistent Recall retrieval.");
  const term = search?.trim();
  if (supabase && userId) {
    let query = supabase.from("legacy_recall_memories").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (context) query = query.eq("context", context);
    if (term) {
      const safe = term.replace(/,/g, " ");
      query = query.or(`title.ilike.%${safe}%,narrative.ilike.%${safe}%`);
    }
    const { data, error } = await query;
    if (error) throw new Error(`Recall retrieval failed: ${error.message}`);
    return (data ?? []).map((row) => mapRow(row));
  }
  const result = context ? memoryStore.filter((memory) => memory.context === context) : [...memoryStore];
  if (!term) return result;
  const normalized = term.toLowerCase();
  return result.filter((memory) => `${memory.title} ${memory.narrative}`.toLowerCase().includes(normalized));
}

export async function getRecallMemoryById(id: string, userId?: string | null): Promise<RecallMemoryRecord | undefined> {
  const supabase = await getSupabaseServerClient();
  if (supabase && !userId) throw new Error("Authentication is required for persistent Recall retrieval.");
  if (supabase && userId) {
    const { data, error } = await supabase.from("legacy_recall_memories").select("*").eq("id", id).eq("user_id", userId).maybeSingle();
    if (error) throw new Error(`Recall retrieval failed: ${error.message}`);
    return data ? mapRow(data) : undefined;
  }
  return memoryStore.find((memory) => memory.id === id);
}

export async function updateRecallMemory(id: string, updates: Record<string, unknown>, userId?: string | null): Promise<RecallMemoryRecord | undefined> {
  const supabase = await getSupabaseServerClient();
  if (supabase && !userId) throw new Error("Authentication is required for persistent Recall updates.");
  if (supabase && userId) {
    const payload: Record<string, unknown> = {};
    if (typeof updates.title === "string") payload.title = updates.title;
    if (typeof updates.narrative === "string") payload.narrative = updates.narrative;
    if (typeof updates.occurredAt === "string" || updates.occurredAt === null) payload.occurred_at = updates.occurredAt;
    if (Array.isArray(updates.people)) payload.people = updates.people;
    if (Array.isArray(updates.sourceRefs)) payload.source_refs = updates.sourceRefs;
    if (typeof updates.evidenceClass === "string") payload.evidence_class = updates.evidenceClass;
    if (typeof updates.confidence === "number" || updates.confidence === null) payload.confidence = updates.confidence;
    if (typeof updates.provenanceComplete === "boolean") payload.provenance_complete = updates.provenanceComplete;
    const { data, error } = await supabase.from("legacy_recall_memories").update(payload).eq("id", id).eq("user_id", userId).select().maybeSingle();
    if (error) throw new Error(`Recall update failed: ${error.message}`);
    return data ? mapRow(data) : undefined;
  }
  const memory = memoryStore.find((item) => item.id === id);
  if (!memory) return undefined;
  Object.assign(memory, updates);
  return memory;
}

export async function deleteRecallMemory(id: string, userId?: string | null): Promise<boolean> {
  const supabase = await getSupabaseServerClient();
  if (supabase && !userId) throw new Error("Authentication is required for persistent Recall deletion.");
  if (supabase && userId) {
    const { data, error } = await supabase.from("legacy_recall_memories").delete().eq("id", id).eq("user_id", userId).select("id");
    if (error) throw new Error(`Recall deletion failed: ${error.message}`);
    return Boolean(data?.length);
  }
  const index = memoryStore.findIndex((memory) => memory.id === id);
  if (index < 0) return false;
  memoryStore.splice(index, 1);
  return true;
}
