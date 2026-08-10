import { describe, expect, it } from "vitest";
import { authorizeEchoAccess, canAccessMemory } from "./access.js";
import type { Memory, MemoryGraph, MemoryQueryContext } from "./model.js";

const memory: Memory = {
  id: "memory:fishing",
  subjectPersonId: "dad",
  title: "Fishing",
  summary: "A documented fishing trip.",
  participantIds: ["dad", "daughter"],
  evidence: [],
  knowledgeState: "known",
  confidence: 0.97,
  visibility: "family",
  tags: ["fishing"],
  createdAt: "2026-08-09T00:00:00Z",
  updatedAt: "2026-08-09T00:00:00Z",
};

const graph: MemoryGraph = {
  people: [],
  relationships: [
    {
      id: "rel:dad:daughter",
      fromPersonId: "dad",
      toPersonId: "daughter",
      label: "daughter",
      confidence: 0.98,
      sourceIds: ["family-record"],
    },
  ],
  sources: [],
  memories: [memory],
};

const context: MemoryQueryContext = {
  viewerPersonId: "daughter",
  subjectPersonId: "dad",
  query: "Tell me about fishing",
};

describe("Echo authorization", () => {
  it("allows a verified family relationship within the visibility boundary", () => {
    const authorization = authorizeEchoAccess(graph, context, "family");
    expect(canAccessMemory(memory, authorization)).toEqual({
      allowed: true,
      reason: "authorized",
    });
  });

  it("blocks a viewer when the relationship cannot be verified", () => {
    const authorization = authorizeEchoAccess(graph, {
      ...context,
      viewerPersonId: "stranger",
    });
    expect(authorization.relationshipVerified).toBe(false);
    expect(canAccessMemory(memory, authorization).reason).toBe("relationship-unverified");
  });

  it("blocks a memory belonging to another subject", () => {
    const authorization = authorizeEchoAccess(graph, context, "family");
    expect(
      canAccessMemory({ ...memory, subjectPersonId: "someone-else" }, authorization).reason,
    ).toBe("subject-mismatch");
  });
});
