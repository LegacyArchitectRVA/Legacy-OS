export type MemoryEvidenceKind =
  | "photo"
  | "video"
  | "audio"
  | "message"
  | "note"
  | "email"
  | "social"
  | "document"
  | "receipt"
  | "financial-transaction"
  | "family-submission";

export type MemoryKnowledgeState = "known" | "reconstructed" | "inferred" | "unknown";
export type MemoryVisibility = "private" | "trusted" | "family" | "successor";

export interface MemoryPerson { id: string; displayName: string; relationshipLabels: string[]; }
export interface MemorySource {
  id: string; kind: MemoryEvidenceKind; title: string; uri?: string; capturedAt?: string;
  importedAt: string; contentHash?: string; ownerPersonId?: string;
}
export interface MemoryEvidence {
  id: string; sourceId: string; kind: MemoryEvidenceKind; excerpt?: string;
  capturedAt?: string; confidence: number; original?: boolean;
}
export interface MemoryReceiptLineItem { description: string; quantity?: number; amount?: number; }
export interface MemoryReceiptEvidence extends MemoryEvidence {
  kind: "receipt"; merchant?: string; transactionDate?: string; totalAmount?: number;
  currency?: string; lineItems?: MemoryReceiptLineItem[];
}
export interface MemoryFinancialEvidence extends MemoryEvidence {
  kind: "financial-transaction"; merchant?: string; transactionDate?: string;
  amount?: number; currency?: string; accountLast4?: string;
}
export interface MemoryRelationship {
  id: string; fromPersonId: string; toPersonId: string; label: string;
  confidence: number; sourceIds: string[];
}
export interface Memory {
  id: string; subjectPersonId: string; title: string; summary: string; occurredAt?: string;
  location?: string; participantIds: string[]; evidence: MemoryEvidence[];
  knowledgeState: MemoryKnowledgeState; confidence: number; visibility: MemoryVisibility;
  tags: string[]; createdAt: string; updatedAt: string;
}
export interface MemoryGraph { people: MemoryPerson[]; relationships: MemoryRelationship[]; sources: MemorySource[]; memories: Memory[]; }
export interface MemoryQueryContext { viewerPersonId: string; subjectPersonId: string; relationship?: string; query: string; }
export interface MemoryMatch { memory: Memory; score: number; matchedEvidence: MemoryEvidence[]; relationshipRelevance: number; }
export interface MemoryResponse {
  answer: string; matches: MemoryMatch[];
  disclosure: { knowledgeState: MemoryKnowledgeState; confidence: number; evidenceCount: number };
}
