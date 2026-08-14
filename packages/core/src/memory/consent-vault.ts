import type { MemoryVisibility } from "./model.js";

export type ConsentScope =
  | "memory"
  | "media"
  | "messages"
  | "social"
  | "receipts"
  | "financial-statements"
  | "financial-accounts"
  | "voice"
  | "avatar"
  | "reconstruction";

export type ConsentStatus = "pending" | "granted" | "revoked" | "expired";
export type SignatureMethod = "electronic" | "physical-upload";

export interface ConsentSignatureEvidence {
  method: SignatureMethod;
  artifactSourceId: string;
  contentHash: string;
  signedAt: string;
  signerPersonId: string;
}

export interface EchoConsentRecord {
  id: string;
  subjectPersonId: string;
  scope: ConsentScope;
  status: ConsentStatus;
  visibility: MemoryVisibility;
  grantedAt?: string;
  expiresAt?: string;
  revokedAt?: string;
  source: "subject" | "authorized-representative";
  policyVersion: string;
  signature?: ConsentSignatureEvidence;
  connectionIds: string[];
}

export interface ConsentAuditEvent {
  id: string;
  consentId: string;
  action: "requested" | "granted" | "revoked" | "expired";
  occurredAt: string;
  actorPersonId: string;
  policyVersion: string;
}

const VISIBILITY_ORDER: Record<MemoryVisibility, number> = {
  private: 0,
  trusted: 1,
  family: 2,
  successor: 3,
};

export function evaluateConsent(
  records: EchoConsentRecord[],
  subjectPersonId: string,
  scope: ConsentScope,
  requestedVisibility: MemoryVisibility,
  now = new Date(),
): { allowed: boolean; reason: "granted" | "missing" | "revoked" | "expired" | "visibility-restricted" } {
  const record = records.find(
    (candidate) => candidate.subjectPersonId === subjectPersonId && candidate.scope === scope,
  );
  if (!record || record.status === "pending") return { allowed: false, reason: "missing" };
  if (record.status === "revoked") return { allowed: false, reason: "revoked" };
  if (record.status === "expired") return { allowed: false, reason: "expired" };
  if (record.expiresAt && new Date(record.expiresAt) <= now) return { allowed: false, reason: "expired" };
  if (VISIBILITY_ORDER[requestedVisibility] > VISIBILITY_ORDER[record.visibility]) {
    return { allowed: false, reason: "visibility-restricted" };
  }
  return { allowed: true, reason: "granted" };
}

export function canUseConnectedSource(
  records: EchoConsentRecord[],
  subjectPersonId: string,
  scope: ConsentScope,
  visibility: MemoryVisibility,
  now = new Date(),
): boolean {
  return evaluateConsent(records, subjectPersonId, scope, visibility, now).allowed;
}
