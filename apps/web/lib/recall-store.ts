import type { RecallContext, RecallMemoryRecord } from "./recall";
import { getSupabaseServerClient } from "./supabase/server";

const memoryStore = new Map<string, RecallMemoryRecord[]>();

export async function getRecallUserId() {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
}

function requireUserId(userId?: string | null): string {
  if (!userId) throw new Error("Authentication is required for Recall storage.");
  return userId;
}

function mapRow(row: Record<string, unknown>): RecallMemoryRecord {
  return {
    id: String(row.id),
    context: row.context as RecallContext,
    title: String(row.title),
    narrative: String(row.narrative),
    occurredAt: typeof row.occurred_at === "string" ? row.occurred_at : undefined,
    location: typeof row.location === "string" ? row.location : undefined,
    people: Array.isArray(row.people) ? row.people.filter((v): v is string => typeof v === "string") : [],
    sourceRefs: Array.isArray(row.source_refs) ? row.source_refs.filter((v): v is string => typeof v === "string") : [],
    evidenceClass: row.evidence_class as RecallMemoryRecord["evidenceClass"],
    confidence: typeof row.confidence === "number" ? row.confidence : undefined,
    createdAt: String(row.created_at),
    provenanceComplete: Boolean(row.provenance_complete),
  };
}

export async function saveRecallMemory(memory: RecallMemoryRecord, userId?: string | null): Promise<RecallMemoryRecord> {
  const ownerId = requireUserId(userId);
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("legacy_recall_memories")
      .insert({
        user_id: ownerId,
        context: memory.context,
        title: memory.title,
        narrative: memory.narrative,
        occurred_at: memory.occurredAt ?? null,
        location: memory.location ?? null,
        people: memory.people ?? [],
        source_refs: memory.sourceRefs ?? [],
        evidence_class: memory.evidenceClass,
        confidence: memory.confidence ?? null,
        provenance_complete: memory.provenanceComplete,
      })
      .select()
      .single();
    if (error) throw new Error(`Recall persistence failed: ${error.message}`);
    return mapRow(data);
  }

  const memories = memoryStore.get(ownerId) ?? [];
  memories.push(memory);
  memoryStore.set(ownerId, memories);
  return memory;
}

export async function listRecallMemories(context?: RecallContext, userId?: string | null, search?: string): Promise<RecallMemoryRecord[]> {
  const ownerId = requireUserId(userId);
  const supabase = await getSupabaseServerClient();
  const term = search?.trim();

  if (supabase) {
    const baseQuery = () => supabase
      .from("legacy_recall_memories")
      .select("*")
      .eq("user_id", ownerId)
      .order("created_at", { ascending: false });

    if (!term) {
      let query = baseQuery();
      if (context) query = query.eq("context", context);
      const { data, error } = await query;
      if (error) throw new Error("Unable to retrieve Recall memories.");
      return (data ?? []).map((row) => mapRow(row));
    }

    const pattern = `%${term}%`;
    const [titleResult, narrativeResult] = await Promise.all([
      (() => {
        let query = baseQuery().ilike("title", pattern);
        if (context) query = query.eq("context", context);
        return query;
      })(),
      (() => {
        let query = baseQuery().ilike("narrative", pattern);
        if (context) query = query.eq("context", context);
        return query;
      })(),
    ]);
    if (titleResult.error || narrativeResult.error) throw new Error("Unable to retrieve Recall memories.");

    const byId = new Map<string, RecallMemoryRecord>();
    for (const row of [...(titleResult.data ?? []), ...(narrativeResult.data ?? [])]) {
      const memory = mapRow(row);
      byId.set(memory.id, memory);
    }
    return [...byId.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  const memories = context
    ? (memoryStore.get(ownerId) ?? []).filter((memory) => memory.context === context)
    : [...(memoryStore.get(ownerId) ?? [])];
  if (!term) return memories;
  const normalized = term.toLowerCase();
  return memories.filter((memory) => `${memory.title} ${memory.narrative}`.toLowerCase().includes(normalized));
}

export async function getRecallMemoryById(id: string, userId?: string | null): Promise<RecallMemoryRecord | undefined> {
  const ownerId = requireUserId(userId);
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("legacy_recall_memories")
      .select("*")
      .eq("id", id)
      .eq("user_id", ownerId)
      .maybeSingle();
    if (error) throw new Error("Unable to retrieve Recall memory.");
    return data ? mapRow(data) : undefined;
  }
  return (memoryStore.get(ownerId) ?? []).find((memory) => memory.id === id);
}

export async function updateRecallMemory(id: string, updates: Record<string, unknown>, userId?: string | null): Promise<RecallMemoryRecord | undefined> {
  const ownerId = requireUserId(userId);
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const payload: Record<string, unknown> = {};
    if (typeof updates.title === "string") payload.title = updates.title;
    if (typeof updates.narrative === "string") payload.narrative = updates.narrative;
    if (typeof updates.occurredAt === "string" || updates.occurredAt === null) payload.occurred_at = updates.occurredAt;
    if (typeof updates.location === "string" || updates.location === null) payload.location = updates.location;
    if (Array.isArray(updates.people)) payload.people = updates.people;
    if (Array.isArray(updates.sourceRefs)) payload.source_refs = updates.sourceRefs;
    if (typeof updates.evidenceClass === "string") payload.evidence_class = updates.evidenceClass;
    if (typeof updates.confidence === "number" || updates.confidence === null) payload.confidence = updates.confidence;
    if (typeof updates.provenanceComplete === "boolean") payload.provenance_complete = updates.provenanceComplete;
    if (Object.keys(payload).length === 0) return getRecallMemoryById(id, ownerId);

    const { data, error } = await supabase
      .from("legacy_recall_memories")
      .update(payload)
      .eq("id", id)
      .eq("user_id", ownerId)
      .select()
      .maybeSingle();
    if (error) throw new Error("Unable to update Recall memory.");
    return data ? mapRow(data) : undefined;
  }

  const memories = memoryStore.get(ownerId) ?? [];
  const memory = memories.find((item) => item.id === id);
  if (!memory) return undefined;
  Object.assign(memory, updates);
  return memory;
}

export async function deleteRecallMemory(id: string, userId?: string | null): Promise<boolean> {
  const ownerId = requireUserId(userId);
  const supabase = await getSupabaseServerClient();
  if (supabase) {
    const { data, error } = await supabase
      .from("legacy_recall_memories")
      .delete()
      .eq("id", id)
      .eq("user_id", ownerId)
      .select("id");
    if (error) throw new Error("Unable to delete Recall memory.");
    return Boolean(data?.length);
  }

  const memories = memoryStore.get(ownerId) ?? [];
  const index = memories.findIndex((memory) => memory.id === id);
  if (index < 0) return false;
  memories.splice(index, 1);
  memoryStore.set(ownerId, memories);
  return true;
}
