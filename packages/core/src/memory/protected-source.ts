import type { MemoryVisibility } from "./model.js";
import {
  authorizeSourceConnection,
  type ProtectedSourceRequest,
  type SourceAuthorizationDecision,
} from "./source-authorization.js";
import type { EchoConsentRecord } from "./consent-vault.js";

export interface ProtectedSourcePayload {
  sourceId: string;
  subjectPersonId: string;
  scope: ProtectedSourceRequest["scope"];
  visibility: MemoryVisibility;
  payload: unknown;
}

export interface IngestionReceipt {
  sourceId: string;
  accepted: boolean;
  decision: SourceAuthorizationDecision;
}

export function ingestProtectedSource(
  records: EchoConsentRecord[],
  request: ProtectedSourcePayload,
  now = new Date(),
): IngestionReceipt {
  const decision = authorizeSourceConnection(records, request, now);

  return {
    sourceId: request.sourceId,
    accepted: decision.allowed,
    decision,
  };
}
