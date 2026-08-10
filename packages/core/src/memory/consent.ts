import type { MemoryVisibility } from "./model.js";

export type ConsentScope = "memory" | "media" | "voice" | "avatar" | "reconstruction";
export type ConsentStatus = "granted" | "revoked" | "pending";

export interface EchoConsentGrant {
  id: string;
  subjectPersonId: string;
  scope: ConsentScope;
  status: ConsentStatus;
  visibility: MemoryVisibility;
  grantedAt: string;
  expiresAt?: string;
  source: "subject" | "authorized-representative";
  policyVersion: string;
}

export interface ConsentDecision {
  allowed: boolean;
  reason: "granted" | "missing" | "revoked" | "expired" | "visibility-restricted";
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
  if (grant.status !== "granted") return { allowed: false, reason: "missing" };
  if (grant.expiresAt && new Date(grant.expiresAt) <= now) {
    return { allowed: false, reason: "expired" };
  }
  if (VISIBILITY_ORDER[requestedVisibility] > VISIBILITY_ORDER[grant.visibility]) {
    return { allowed: false, reason: "visibility-restricted" };
  }

  return { allowed: true, reason: "granted" };
}
