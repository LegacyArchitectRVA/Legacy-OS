export const recallContexts = ["personal", "family", "business"] as const;
export type RecallContext = (typeof recallContexts)[number];

export const evidenceClasses = ["known", "reconstructed", "inferred", "unknown"] as const;
export type EvidenceClass = (typeof evidenceClasses)[number];

export interface RecallMemoryInput {
  context: RecallContext;
  title: string;
  narrative: string;
  occurredAt?: string;
  people?: string[];
  sourceRefs?: string[];
  evidenceClass: EvidenceClass;
  confidence?: number;
}

export interface RecallMemoryRecord extends RecallMemoryInput {
  id: string;
  createdAt: string;
  provenanceComplete: boolean;
}

export function isRecallContext(value: unknown): value is RecallContext {
  return typeof value === "string" && recallContexts.includes(value as RecallContext);
}

export function isEvidenceClass(value: unknown): value is EvidenceClass {
  return typeof value === "string" && evidenceClasses.includes(value as EvidenceClass);
}

export function normalizeRecallMemory(input: RecallMemoryInput): RecallMemoryRecord {
  const sourceRefs = input.sourceRefs?.map((value) => value.trim()).filter(Boolean) ?? [];
  const people = input.people?.map((value) => value.trim()).filter(Boolean) ?? [];
  const confidence = input.confidence === undefined ? undefined : Math.min(1, Math.max(0, input.confidence));

  return {
    ...input,
    title: input.title.trim(),
    narrative: input.narrative.trim(),
    people,
    sourceRefs,
    confidence,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    provenanceComplete: sourceRefs.length > 0 && input.evidenceClass !== "unknown",
  };
}
