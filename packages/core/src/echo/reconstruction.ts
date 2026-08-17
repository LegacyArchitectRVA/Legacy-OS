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

export interface ReconstructionAuthorization {
  allowed: boolean;
  reason: "authorized" | "consent-missing" | "consent-expired" | "consent-future" | "consent-invalid" | "scope-restricted" | "evidence-missing" | "subject-mismatch";
}

function consentStatus(consent: ReconstructionConsent, now: Date): ReconstructionAuthorization {
  if (!consent.enabled) return { allowed: false, reason: "consent-missing" };
  if (!consent.grantedBy) return { allowed: false, reason: "consent-invalid" };
  const grantedAt = Date.parse(consent.grantedAt);
  if (!Number.isFinite(grantedAt)) return { allowed: false, reason: "consent-invalid" };
  if (grantedAt > now.getTime()) return { allowed: false, reason: "consent-future" };
  if (!consent.expiresAt) return { allowed: true, reason: "authorized" };
  const expiresAt = Date.parse(consent.expiresAt);
  if (!Number.isFinite(expiresAt)) return { allowed: false, reason: "consent-invalid" };
  return now.getTime() < expiresAt ? { allowed: true, reason: "authorized" } : { allowed: false, reason: "consent-expired" };
}

export function createReconstructionSegment(input: Omit<ReconstructionSegment, "generated">): ReconstructionSegment {
  if (!input.subjectPersonId) throw new Error("Reconstruction requires a subject person");
  if (input.sourceIds.length === 0) throw new Error("Reconstruction requires source evidence");
  if (input.confidence < 0 || input.confidence > 1) throw new Error("Reconstruction confidence must be between 0 and 1");
  return { ...input, generated: true };
}

export function evaluateExperiencePlanAuthorization(plan: EchoExperiencePlan, consent: ReconstructionConsent, now = new Date()): ReconstructionAuthorization {
  if (!plan.subjectPersonId || plan.segments.some((segment) => segment.subjectPersonId !== plan.subjectPersonId)) return { allowed: false, reason: "subject-mismatch" };
  const status = consentStatus(consent, now);
  if (!status.allowed) return status;
  for (const segment of plan.segments) {
    if (segment.sourceIds.length === 0) return { allowed: false, reason: "evidence-missing" };
    if (!consent.scope.includes(segment.kind)) return { allowed: false, reason: "scope-restricted" };
  }
  return { allowed: true, reason: "authorized" };
}

export function authorizeExperiencePlan(plan: EchoExperiencePlan, consent: ReconstructionConsent, now = new Date()): EchoExperiencePlan {
  const authorization = evaluateExperiencePlanAuthorization(plan, consent, now);
  if (!authorization.allowed) throw new Error(`Reconstruction authorization denied: ${authorization.reason}`);
  return plan;
}

export function createExperiencePlan(subjectPersonId: string, viewerPersonId: string, memoryId: string, sourceIds: string[]): EchoExperiencePlan {
  return {
    subjectPersonId,
    viewerPersonId,
    memoryId,
    segments: [createReconstructionSegment({
      id: `${memoryId}:scene`,
      kind: "scene",
      subjectPersonId,
      knowledgeState: "reconstructed",
      confidence: 0,
      sourceIds: [...new Set(sourceIds)],
      consentScope: "reconstruction",
    })],
  };
}
