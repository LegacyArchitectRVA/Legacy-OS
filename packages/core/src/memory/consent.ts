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

export type ConsentStatus = "granted" | "revoked" | "pending" | "expired";
export type ConsentSource = "subject" | "authorized-representative";
export type SignatureMethod = "electronic" | "physical-upload";

export interface ConsentSignature {
  id: string;
  method: SignatureMethod;
  signerPersonId: string;
  signedAt: string;
  artifactSourceId?: string;
  artifactHash?: string;
}

export interface EchoConsentGrant {
  id: string;
  subjectPersonId: string;
  scope: ConsentScope;
  status: ConsentStatus;
  visibility: MemoryVisibility;
  grantedAt: string;
  expiresAt?: string;
  source: ConsentSource;
  policyVersion: string;
  signature?: ConsentSignature;
  connectedSourceIds: string[];
}

export interface ConsentAuditEvent {
  id: string;
  consentId: string;
  action: "requested" | "granted" | "revoked" | "expired";
  occurredAt: string;
  actorPersonId: string;
  policyVersion: string;
}

export interface ConsentDecision {
  allowed: boolean;
  reason: "granted" | "missing" | "revoked" | "expired" | "visibility-restricted" | "signature-required";
}

const VISIBILITY_ORDER: Record<MemoryVisibility, number> = {
  private: 0,
  trusted: 1,
  family: 2,
  successor: 3,
};

export function evaluateConsent(
  grants: EchoConsentGrant[],
  subjectPersonId: string,
  scope: ConsentScope,
  requestedVisibility: MemoryVisibility,
  now = new Date(),
): ConsentDecision {
  const grant = grants.find(
    (candidate) =>
      candidate.subjectPersonId === subjectPersonId && candidate.scope === scope,
  );

  if (!grant) return { allowed: false, reason: "missing" };
  if (grant.status === "revoked") return { allowed: false, reason: "revoked" };
  if (grant.status !== "granted") return { allowed: false, reason: grant.status === "expired" ? "expired" : "missing" };
  if (grant.expiresAt && new Date(grant.expiresAt) <= now) {
    return { allowed: false, reason: "expired" };
  }
  if (VISIBILITY_ORDER[requestedVisibility] > VISIBILITY_ORDER[grant.visibility]) {
    return { allowed: false, reason: "visibility-restricted" };
  }
  if ((scope === "financial-accounts" || scope === "voice" || scope === "avatar" || scope === "reconstruction") && !grant.signature) {
    return { allowed: false, reason: "signature-required" };
  }

  return { allowed: true, reason: "granted" };
}

export function canConnectSource(
  grants: EchoConsentGrant[],
  subjectPersonId: string,
  scope: ConsentScope,
  requestedVisibility: MemoryVisibility,
  now = new Date(),
): boolean {
  return evaluateConsent(grants, subjectPersonId, scope, requestedVisibility, now).allowed;
}
