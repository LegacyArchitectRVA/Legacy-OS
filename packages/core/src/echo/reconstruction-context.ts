export interface ReconstructionEvidence {
  sourceId: string;
  kind: string;
  confidence: number;
  statement: string;
}

export interface ReconstructionContext {
  memoryId: string;
  subjectPersonId: string;
  viewerPersonId: string;
  time?: {
    startAt?: string;
    endAt?: string;
    confidence: number;
    sourceIds: string[];
  };
  location?: {
    label?: string;
    latitude?: number;
    longitude?: number;
    confidence: number;
    sourceIds: string[];
  };
  environment?: {
    weather?: Record<string, string | number | boolean | null>;
    daylight?: Record<string, string | number | boolean | null>;
    sourceIds: string[];
    confidence: number;
  };
  originalMedia: string[];
  evidence: ReconstructionEvidence[];
}

export function buildReconstructionContext(input: ReconstructionContext): ReconstructionContext {
  if (!input.memoryId || !input.subjectPersonId || !input.viewerPersonId) {
    throw new Error("A reconstruction context requires memory, subject, and viewer identity");
  }

  for (const evidence of input.evidence) {
    if (!evidence.sourceId) throw new Error("Reconstruction evidence requires a source ID");
    if (evidence.confidence < 0 || evidence.confidence > 1) {
      throw new Error(`Invalid evidence confidence for ${evidence.sourceId}`);
    }
  }

  return {
    ...input,
    originalMedia: [...new Set(input.originalMedia)],
    evidence: [...input.evidence].sort((a, b) => b.confidence - a.confidence),
  };
}

export function verifiedContextStatements(context: ReconstructionContext): string[] {
  const statements: string[] = [];
  for (const evidence of context.evidence) {
    if (evidence.confidence >= 0.9) statements.push(evidence.statement);
  }
  return statements;
}
