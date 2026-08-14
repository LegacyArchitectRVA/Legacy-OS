import type { MemoryVisibility } from "./model.js";
import {
  canConnectSource,
  type ConsentGrant,
  type ConsentScope,
} from "./consent-vault.js";

export interface ProtectedSourceRequest {
  sourceId: string;
  subjectPersonId: string;
  scope: ConsentScope;
  visibility: MemoryVisibility;
}

export interface SourceAuthorizationDecision {
  allowed: boolean;
  sourceId: string;
  scope: ConsentScope;
  reason: "authorized" | "missing" | "pending" | "revoked" | "expired" | "visibility-restricted";
}

export function authorizeSourceConnection(
  grants: ConsentGrant[],
  request: ProtectedSourceRequest,
  now = new Date(),
): SourceAuthorizationDecision {
  const grant = grants.find(
    (candidate) =>
      candidate.subjectPersonId === request.subjectPersonId &&
      candidate.scope === request.scope,
  );

  if (!grant) {
    return { allowed: false, sourceId: request.sourceId, scope: request.scope, reason: "missing" };
  }

  if (!grant.signature) {
    return { allowed: false, sourceId: request.sourceId, scope: request.scope, reason: "pending" };
  }

  const allowed = canConnectSource(
    grants,
    request.subjectPersonId,
    request.scope,
    request.visibility,
    now,
  );

  if (allowed) {
    return { allowed: true, sourceId: request.sourceId, scope: request.scope, reason: "authorized" };
  }

  if (grant.status === "revoked") {
    return { allowed: false, sourceId: request.sourceId, scope: request.scope, reason: "revoked" };
  }
  if (grant.status === "expired" || (grant.expiresAt && new Date(grant.expiresAt) <= now)) {
    return { allowed: false, sourceId: request.sourceId, scope: request.scope, reason: "expired" };
  }
  if (grant.status !== "granted") {
    return { allowed: false, sourceId: request.sourceId, scope: request.scope, reason: "pending" };
  }

  return { allowed: false, sourceId: request.sourceId, scope: request.scope, reason: "visibility-restricted" };
}
