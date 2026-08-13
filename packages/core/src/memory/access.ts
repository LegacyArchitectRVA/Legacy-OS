import type { Memory, MemoryGraph, MemoryQueryContext, MemoryVisibility } from "./model.js";

const VISIBILITY_ORDER: Record<MemoryVisibility, number> = {
  private: 0,
  trusted: 1,
  family: 2,
  successor: 3,
};

export interface EchoAuthorization {
  viewerPersonId: string;
  subjectPersonId: string;
  allowedVisibility: MemoryVisibility;
  relationshipVerified: boolean;
}

export interface EchoAccessDecision {
  allowed: boolean;
  reason:
    | "authorized"
    | "subject-mismatch"
    | "relationship-unverified"
    | "visibility-restricted";
}

export function authorizeEchoAccess(
  graph: MemoryGraph,
  context: MemoryQueryContext,
  allowedVisibility: MemoryVisibility = "family",
): EchoAuthorization {
  const relationshipVerified =
    context.viewerPersonId === context.subjectPersonId ||
    graph.relationships.some(
      (relationship) =>
        relationship.confidence >= 0.8 &&
        ((relationship.fromPersonId === context.subjectPersonId && relationship.toPersonId === context.viewerPersonId) ||
          (relationship.fromPersonId === context.viewerPersonId && relationship.toPersonId === context.subjectPersonId)),
    );

  return {
    viewerPersonId: context.viewerPersonId,
    subjectPersonId: context.subjectPersonId,
    allowedVisibility,
    relationshipVerified,
  };
}

export function canAccessMemory(
  memory: Memory,
  authorization: EchoAuthorization,
): EchoAccessDecision {
  if (memory.subjectPersonId !== authorization.subjectPersonId) {
    return { allowed: false, reason: "subject-mismatch" };
  }

  if (!authorization.relationshipVerified) {
    return { allowed: false, reason: "relationship-unverified" };
  }

  if (VISIBILITY_ORDER[memory.visibility] > VISIBILITY_ORDER[authorization.allowedVisibility]) {
    return { allowed: false, reason: "visibility-restricted" };
  }

  return { allowed: true, reason: "authorized" };
}
