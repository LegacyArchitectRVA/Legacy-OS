import { describe, expect, it } from "vitest";
import { evaluateEchoDisclosure } from "./echo-disclosure.js";
import type { Memory, MemoryGraph } from "./model.js";

const graph: MemoryGraph = {
  people: [
    { id: "dad", displayName: "Dad", relationshipLabels: ["father"] },
    { id: "child", displayName: "Alex", relationshipLabels: ["child"] },
  ],
  relationships: [
    { id: "r1", fromPersonId: "dad", toPersonId: "child", label: "son", confidence: 0.98, sourceIds: ["family"] },
  ],
  sources: [],
  memories: [],
};

const memory: Memory = {
  id: "memory:1",
  subjectPersonId: "dad",
  title: "Fishing trip",
  summary: "Dad went fishing with Alex.",
  participantIds: ["dad", "child"],
  evidence: [],
  knowledgeState: "known",
  confidence: 0.94,
  visibility: "family",
  tags: ["fishing"],
  createdAt: "2026-08-11T00:00:00Z",
  updatedAt: "2026-08-11T00:00:00Z",
};

describe("Echo disclosure", () => {
  it("authorizes a known memory for an established relationship", () => {
    expect(evaluateEchoDisclosure(graph, memory, {
      viewerPersonId: "child",
      subjectPersonId: "dad",
      query: "remember fishing",
    }).reason).toBe("authorized");
  });

  it("blocks a viewer with no established relationship", () => {
    expect(evaluateEchoDisclosure(graph, memory, {
      viewerPersonId: "stranger",
      subjectPersonId: "dad",
      query: "remember fishing",
    }).reason).toBe("no-relationship");
  });

  it("blocks low-confidence memories", () => {
    expect(evaluateEchoDisclosure(graph, { ...memory, confidence: 0.5 }, {
      viewerPersonId: "child",
      subjectPersonId: "dad",
      query: "remember fishing",
    }).reason).toBe("insufficient-confidence");
  });
});
