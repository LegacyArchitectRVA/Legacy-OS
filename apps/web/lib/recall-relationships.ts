import type { RecallMemoryRecord } from "./recall";

export type RecallRelationshipKind = "shared_person" | "shared_source" | "same_context" | "temporal_overlap";

export interface RecallRelationship { fromId: string; toId: string; kinds: RecallRelationshipKind[]; score: number; }
export interface RecallConflict { memoryIds: string[]; reason: string; severity: "review" | "high"; }

export function findRecallRelationships(memories: RecallMemoryRecord[]): RecallRelationship[] {
  const relationships: RecallRelationship[] = [];
  for (let i = 0; i < memories.length; i += 1) for (let j = i + 1; j < memories.length; j += 1) {
    const a = memories[i]; const b = memories[j]; const kinds: RecallRelationshipKind[] = [];
    if (a.context === b.context) kinds.push("same_context");
    if (a.people.some((person) => b.people.includes(person))) kinds.push("shared_person");
    if (a.sourceRefs.some((source) => b.sourceRefs.includes(source))) kinds.push("shared_source");
    if (a.occurredAt && b.occurredAt && Math.abs(Date.parse(a.occurredAt) - Date.parse(b.occurredAt)) <= 86_400_000) kinds.push("temporal_overlap");
    if (kinds.length) relationships.push({ fromId: a.id, toId: b.id, kinds, score: Math.min(1, kinds.length / 3) });
  }
  return relationships;
}

export function findRecallConflicts(memories: RecallMemoryRecord[]): RecallConflict[] {
  const conflicts: RecallConflict[] = [];
  for (let i = 0; i < memories.length; i += 1) for (let j = i + 1; j < memories.length; j += 1) {
    const a = memories[i]; const b = memories[j];
    const sameSubject = a.people.length > 0 && a.people.some((person) => b.people.includes(person));
    const closeInTime = Boolean(a.occurredAt && b.occurredAt && Math.abs(Date.parse(a.occurredAt) - Date.parse(b.occurredAt)) <= 86_400_000);
    const contradictory = /\bnot\b|\bnever\b|\bno longer\b|\bincorrect\b|\bwrong\b/i.test(a.narrative) !== /\bnot\b|\bnever\b|\bno longer\b|\bincorrect\b|\bwrong\b/i.test(b.narrative);
    if (sameSubject && closeInTime && contradictory) conflicts.push({ memoryIds: [a.id, b.id], reason: "Related memories contain potentially contradictory statements and should be reviewed against their evidence.", severity: "review" });
  }
  return conflicts;
}
