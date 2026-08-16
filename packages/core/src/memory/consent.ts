import type { MemoryVisibility } from "./model.js";

export type ConsentScope =
  | "memory" | "media" | "messages" | "social" | "receipts"
  | "financial-statements" | "financial-accounts" | "voice" | "avatar" | "reconstruction";
export type ConsentStatus = "granted" | "revoked" | "pending" | "expired";
export type ConsentSource = "subject" | "authorized-representative";
export type SignatureMethod = "electronic" | "physical-upload";

export interface ConsentSignature {
  id: string; method: SignatureMethod; signerPersonId: string; signedAt: string;
  artifactSourceId?: string; artifactHash?: string;
}
export interface EchoConsentGrant {
  id: string; subjectPersonId: string; scope: ConsentScope; status: ConsentStatus;
  visibility: MemoryVisibility; grantedAt: string; expiresAt?: string;
  source: ConsentSource; policyVersion: string; signature?: ConsentSignature;
  connectedSourceIds: string[]; authorizedRepresentativePersonId?: string;
}
export interface ConsentAuditEvent {
  id: string; consentId: string; action: "requested" | "granted" | "revoked" | "expired";
  occurredAt: string; actorPersonId: string; policyVersion: string;
}
export interface ConsentDecision {
  allowed: boolean;
  reason: "granted" | "missing" | "revoked" | "expired" | "visibility-restricted" | "signature-required" | "invalid-signature";
}

const VISIBILITY_ORDER: Record<MemoryVisibility, number> = { private: 0, trusted: 1, family: 2, successor: 3 };
const SIGNED_SCOPES = new Set<ConsentScope>(["financial-accounts", "voice", "avatar", "reconstruction"]);

function validSignature(grant: EchoConsentGrant): boolean {
  const signature = grant.signature;
  if (!signature) return false;
  const authorizedSigner = grant.source === "subject"
    ? signature.signerPersonId === grant.subjectPersonId
    : signature.signerPersonId === grant.authorizedRepresentativePersonId;
  if (!authorizedSigner) return false;
  const signedAt = new Date(signature.signedAt).getTime();
  const grantedAt = new Date(grant.grantedAt).getTime();
  if (!Number.isFinite(signedAt) || !Number.isFinite(grantedAt) || signedAt < grantedAt) return false;
  if (signature.method === "physical-upload" && (!signature.artifactSourceId || !signature.artifactHash)) return false;
  return true;
}

export function evaluateConsent(grants: EchoConsentGrant[], subjectPersonId: string, scope: ConsentScope, requestedVisibility: MemoryVisibility, now = new Date()): ConsentDecision {
  const grant = grants.find(c => c.subjectPersonId === subjectPersonId && c.scope === scope);
  if (!grant) return { allowed: false, reason: "missing" };
  if (grant.status === "revoked") return { allowed: false, reason: "revoked" };
  if (grant.status !== "granted") return { allowed: false, reason: grant.status === "expired" ? "expired" : "missing" };
  if (grant.expiresAt && new Date(grant.expiresAt) <= now) return { allowed: false, reason: "expired" };
  if (VISIBILITY_ORDER[requestedVisibility] > VISIBILITY_ORDER[grant.visibility]) return { allowed: false, reason: "visibility-restricted" };
  if (SIGNED_SCOPES.has(scope) && !grant.signature) return { allowed: false, reason: "signature-required" };
  if (SIGNED_SCOPES.has(scope) && !validSignature(grant)) return { allowed: false, reason: "invalid-signature" };
  return { allowed: true, reason: "granted" };
}

export function canConnectSource(grants: EchoConsentGrant[], subjectPersonId: string, scope: ConsentScope, requestedVisibility: MemoryVisibility, now = new Date()): boolean {
  return evaluateConsent(grants, subjectPersonId, scope, requestedVisibility, now).allowed;
}

export function canUseConnectedSource(grants: EchoConsentGrant[], subjectPersonId: string, scope: ConsentScope, sourceId: string, requestedVisibility: MemoryVisibility, now = new Date()): boolean {
  const grant = grants.find(c => c.subjectPersonId === subjectPersonId && c.scope === scope);
  return !!grant && grant.connectedSourceIds.includes(sourceId) && evaluateConsent(grants, subjectPersonId, scope, requestedVisibility, now).allowed;
}
