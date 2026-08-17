export type ReconstructionKind = "voice" | "avatar" | "scene" | "memory-playback";

export interface ReconstructionSource {
  sourceId: string;
  kind: "photo" | "video" | "audio" | "note" | "message" | "email" | "social" | "document" | "family-submission";
  confidence: number;
}

export interface ReconstructionConsent {
  enabled: boolean;
  scope: readonly ("voice" | "avatar" | "scene" | "memory-playback")[];
  grantedBy: string;
  grantedAt: string;
  expiresAt?: string;
}

export interface ReconstructionSegment {
  id: string;
  kind: ReconstructionKind;
  subjectPersonId: string;
  knowledgeState: "known" | "reconstructed" | "inferred";
  confidence: number;
  sourceIds: string[];
  consentScope: "voice" | "avatar" | "reconstruction";
  generated: boolean;
}

export interface EchoExperiencePlan {
  subjectPersonId: string;
  viewerPersonId: string;
  memoryId: string;
  segments: ReconstructionSegment[];
}

function isActiveConsent(consent: ReconstructionConsent, now: Date): boolean {
  if (!consent.enabled || !consent.grantedBy || !consent.grantedAt) return false;
  const grantedAt = Date.parse(consent.grantedAt);
  if (!Number.isFinite(grantedAt) || grantedAt > now.getTime()) return false;
  if (!consent.expiresAt) return true;
  const expiresAt = Date.parse(consent.expiresAt);
  return Number.isFinite(expiresAt) && now.getTime() < expiresAt;
}

export function createReconstructionSegment(input: Omit<ReconstructionSegment, "generated">): ReconstructionSegment {
  if (!input.subjectPersonId) throw new Error("Reconstruction requires a subject person");
  if (input.sourceIds.length === 0) throw new Error("Reconstruction requires source evidence");
  if (input.confidence < 0 || input.confidence > 1) throw new Error("Reconstruction confidence must be between 0 and 1");
  return { ...input, generated: true };
}

export function authorizeExperiencePlan(
  plan: EchoExperiencePlan,
  consent: ReconstructionConsent,
  now = new Date(),
): EchoExperiencePlan {
  if (!isActiveConsent(consent, now)) throw new Error("Reconstruction consent is not active");
  for (const segment of plan.segments) {
    if (!consent.scope.includes(segment.kind)) {
      throw new Error(`Reconstruction consent does not cover ${segment.kind}`);
    }
    if (segment.sourceIds.length === 0) {
      throw new Error(`Reconstruction segment ${segment.id} has no source evidence`);
    }
  }
  return plan;
}

export function createExperiencePlan(
  subjectPersonId: string,
  viewerPersonId: string,
  memoryId: string,
  sourceIds: string[],
): EchoExperiencePlan {
  return {
    subjectPersonId,
    viewerPersonId,
    memoryId,
    segments: [
      createReconstructionSegment({
        id: `${memoryId}:scene`,
        kind: "scene",
        subjectPersonId,
        knowledgeState: "reconstructed",
        confidence: 0,
        sourceIds: [...new Set(sourceIds)],
        consentScope: "reconstruction",
      }),
    ],
  };
}
