import { evaluateConsent, type EchoConsentGrant } from "./consent.js";
import type { Memory, MemoryGraph, MemoryQueryContext, MemoryVisibility } from "./model.js";

const VISIBILITY_ORDER: Record<MemoryVisibility, number> = { private: 0, trusted: 1, family: 2, successor: 3 };

type ConsentFailure = "consent-missing" | "consent-expired" | "consent-revoked";

export interface EchoAuthorization {
  viewerPersonId: string;
  subjectPersonId: string;
  allowedVisibility: MemoryVisibility;
  relationshipVerified: boolean;
  consentVerified: boolean;
  consentFailure?: ConsentFailure;
}

export interface EchoAccessDecision {
  allowed: boolean;
  reason: "authorized" | "subject-mismatch" | "relationship-unverified" | ConsentFailure | "visibility-restricted";
}

export function authorizeEchoAccess(
  graph: MemoryGraph,
  context: MemoryQueryContext,
  allowedVisibility: MemoryVisibility = "family",
  grants: EchoConsentGrant[] = [],
  now = new Date(),
): EchoAuthorization {
  const viewerIsSubject = context.viewerPersonId === context.subjectPersonId;
  const relationshipVerified = viewerIsSubject || graph.relationships.some(
    relationship => relationship.fromPersonId === context.viewerPersonId &&
      relationship.toPersonId === context.subjectPersonId &&
      relationship.confidence >= 0.8,
  );
  const consent = viewerIsSubject
    ? { allowed: true, reason: "granted" as const }
    : evaluateConsent(grants, context.subjectPersonId, "memory", allowedVisibility, now);

  return {
    viewerPersonId: context.viewerPersonId,
    subjectPersonId: context.subjectPersonId,
    allowedVisibility,
    relationshipVerified,
    consentVerified: consent.allowed,
    consentFailure: consent.allowed
      ? undefined
      : consent.reason === "expired"
        ? "consent-expired"
        : consent.reason === "revoked"
          ? "consent-revoked"
          : consent.reason === "visibility-restricted"
            ? "consent-missing"
            : "consent-missing",
  };
}

export function canAccessMemory(memory: Memory, authorization: EchoAuthorization): EchoAccessDecision {
  if (memory.subjectPersonId !== authorization.subjectPersonId) return { allowed: false, reason: "subject-mismatch" };
  if (!authorization.relationshipVerified) return { allowed: false, reason: "relationship-unverified" };
  if (!authorization.consentVerified) return { allowed: false, reason: authorization.consentFailure ?? "consent-missing" };
  if (VISIBILITY_ORDER[memory.visibility] > VISIBILITY_ORDER[authorization.allowedVisibility]) return { allowed: false, reason: "visibility-restricted" };
  return { allowed: true, reason: "authorized" };
}
