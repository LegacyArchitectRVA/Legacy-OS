import type { RecallContext, RecallMemoryRecord } from "./recall";
import { getSupabaseServerClient } from "./supabase";

const memoryStore: RecallMemoryRecord[] = [];

export async function getRecallUserId() {
  const supabase = getSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

export async function saveRecallMemory(memory: RecallMemoryRecord, userId?: string | null): Promise<RecallMemoryRecord> {
  const supabase = getSupabaseServerClient();

  if (supabase && userId) {
    const { data, error } = await supabase
      .from("legacy_recall_memories")
      .insert({
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
      })
      .select()
      .single();

    if (error) throw new Error(`Recall persistence failed: ${error.message}`);
    return {
      ...memory,
      id: data.id,
      createdAt: data.created_at,
    };
  }

  memoryStore.push(memory);
  return memory;
}

export async function listRecallMemories(context?: RecallContext, userId?: string | null): Promise<RecallMemoryRecord[]> {
  const supabase = getSupabaseServerClient();

  if (supabase && userId) {
    let query = supabase.from("legacy_recall_memories").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (context) query = query.eq("context", context);
    const { data, error } = await query;
    if (error) throw new Error(`Recall retrieval failed: ${error.message}`);
    return (data ?? []).map((row) => ({
      id: row.id,
      context: row.context,
      title: row.title,
      narrative: row.narrative,
      occurredAt: row.occurred_at ?? undefined,
      people: Array.isArray(row.people) ? row.people : [],
      sourceRefs: Array.isArray(row.source_refs) ? row.source_refs : [],
      evidenceClass: row.evidence_class,
      confidence: row.confidence ?? undefined,
      createdAt: row.created_at,
      provenanceComplete: row.provenance_complete,
    }));
  }

  return context ? memoryStore.filter((memory) => memory.context === context) : [...memoryStore];
}

export function getRecallMemory(id: string): RecallMemoryRecord | undefined {
  return memoryStore.find((memory) => memory.id === id);
}
