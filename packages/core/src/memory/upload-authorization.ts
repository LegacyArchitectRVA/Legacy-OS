import type { MemoryVisibility } from "./model.js";
import type { ConsentScope, EchoConsentRecord } from "./consent-vault.js";
import { authorizeSourceConnection, type SourceAuthorizationDecision } from "./source-authorization.js";

export type UploadedSourceKind =
  | "receipt"
  | "financial-statement"
  | "financial-account"
  | "medical"
  | "legal"
  | "document"
  | "photo"
  | "message"
  | "audio"
  | "video"
  | "other";

export interface UploadedSourceClassification {
  sourceId: string;
  subjectPersonId: string;
  kind: UploadedSourceKind;
  proposedScope: ConsentScope;
  visibility: MemoryVisibility;
  contentHash: string;
}

export interface UploadAuthorizationDecision {
  sourceId: string;
  allowed: boolean;
  needsConfirmation: boolean;
  reason: SourceAuthorizationDecision["reason"] | "classification-only";
  proposedScope: ConsentScope;
  message: string;
}

export function classifyUploadedSource(
  input: UploadedSourceClassification,
): UploadedSourceClassification {
  return { ...input };
}

export function authorizeUploadedSource(
  records: EchoConsentRecord[],
  input: UploadedSourceClassification,
  now = new Date(),
): UploadAuthorizationDecision {
  const decision = authorizeSourceConnection(records, {
    sourceId: input.sourceId,
    subjectPersonId: input.subjectPersonId,
    scope: input.proposedScope,
    visibility: input.visibility,
  }, now);

  if (decision.allowed) {
    return {
      sourceId: input.sourceId,
      allowed: true,
      needsConfirmation: false,
      reason: "authorized",
      proposedScope: input.proposedScope,
      message: "This source is authorized and may be processed.",
    };
  }

  return {
    sourceId: input.sourceId,
    allowed: false,
    needsConfirmation: true,
    reason: decision.reason,
    proposedScope: input.proposedScope,
    message: `This upload appears to be ${input.kind.replace(/-/g, " ")}. Authorization for ${input.proposedScope} is required before its protected contents can be processed.`,
  };
}
