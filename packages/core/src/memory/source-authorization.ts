import type { MemoryVisibility } from "./model.js";
import {
  canUseConnectedSource,
  type ConsentScope,
  type EchoConsentRecord,
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
  records: EchoConsentRecord[],
  request: ProtectedSourceRequest,
  now = new Date(),
): SourceAuthorizationDecision {
  const record = records.find(
    (candidate) =>
      candidate.subjectPersonId === request.subjectPersonId &&
      candidate.scope === request.scope,
  );

  if (!record) {
    return { allowed: false, sourceId: request.sourceId, scope: request.scope, reason: "missing" };
  }
  if (!record.signature) {
    return { allowed: false, sourceId: request.sourceId, scope: request.scope, reason: "pending" };
  }

  const allowed = canUseConnectedSource(
    records,
    request.subjectPersonId,
    request.scope,
    request.visibility,
    now,
  );

  if (allowed) {
    return { allowed: true, sourceId: request.sourceId, scope: request.scope, reason: "authorized" };
  }
  if (record.status === "revoked") {
    return { allowed: false, sourceId: request.sourceId, scope: request.scope, reason: "revoked" };
  }
  if (record.status === "expired" || (record.expiresAt && new Date(record.expiresAt) <= now)) {
    return { allowed: false, sourceId: request.sourceId, scope: request.scope, reason: "expired" };
  }
  if (record.status !== "granted") {
    return { allowed: false, sourceId: request.sourceId, scope: request.scope, reason: "pending" };
  }

  return { allowed: false, sourceId: request.sourceId, scope: request.scope, reason: "visibility-restricted" };
}
