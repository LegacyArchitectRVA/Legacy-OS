import { describe, expect, it } from "vitest";
import { authorizeEchoAccess, canAccessMemory } from "./access.js";
import type { Memory, MemoryGraph, MemoryQueryContext } from "./model.js";

const memory: Memory = {
  id: "memory:fishing", subjectPersonId: "dad", title: "Fishing", summary: "A documented fishing trip.",
  participantIds: ["dad", "daughter"], evidence: [], knowledgeState: "known", confidence: 0.97,
  visibility: "family", tags: ["fishing"], createdAt: "2026-08-09T00:00:00Z", updatedAt: "2026-08-09T00:00:00Z",
};
const graph: MemoryGraph = {
  people: [], sources: [], memories: [memory],
  relationships: [{ id: "rel:dad:daughter", fromPersonId: "daughter", toPersonId: "dad", label: "father", confidence: 0.98, sourceIds: ["family-record"] }],
};
const context: MemoryQueryContext = { viewerPersonId: "daughter", subjectPersonId: "dad", query: "Tell me about fishing" };
const grant = { id: "c1", subjectPersonId: "dad", scope: "memory" as const, status: "granted" as const, visibility: "family" as const, grantedAt: "2026-08-01T00:00:00Z", source: "subject" as const, policyVersion: "1" };

describe("Echo authorization", () => {
  it("allows a verified relationship only with active consent", () => {
    const authorization = authorizeEchoAccess(graph, context, "family", [grant], new Date("2026-08-09T00:00:00Z"));
    expect(canAccessMemory(memory, authorization)).toEqual({ allowed: true, reason: "authorized" });
  });
  it("blocks missing consent", () => {
    const authorization = authorizeEchoAccess(graph, context, "family", []);
    expect(canAccessMemory(memory, authorization).reason).toBe("consent-missing");
  });
  it("blocks expired consent", () => {
    const authorization = authorizeEchoAccess(graph, context, "family", [{ ...grant, expiresAt: "2026-08-08T00:00:00Z" }], new Date("2026-08-09T00:00:00Z"));
    expect(canAccessMemory(memory, authorization).reason).toBe("consent-expired");
  });
  it("blocks revoked consent", () => {
    const authorization = authorizeEchoAccess(graph, context, "family", [{ ...grant, status: "revoked" }]);
    expect(canAccessMemory(memory, authorization).reason).toBe("consent-revoked");
  });
  it("rejects the old reverse-direction relationship loophole", () => {
    const reverseGraph = { ...graph, relationships: [{ ...graph.relationships[0], fromPersonId: "dad", toPersonId: "daughter" }] };
    const authorization = authorizeEchoAccess(reverseGraph, context, "family", [grant]);
    expect(authorization.relationshipVerified).toBe(false);
  });
  it("blocks another subject", () => {
    const authorization = authorizeEchoAccess(graph, context, "family", [grant]);
    expect(canAccessMemory({ ...memory, subjectPersonId: "someone-else" }, authorization).reason).toBe("subject-mismatch");
  });
});
