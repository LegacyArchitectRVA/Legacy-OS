import { describe, expect, it } from "vitest";
import { buildGroundedResponse } from "./echo-response.js";
import type { MemoryGraph } from "./model.js";

const graph: MemoryGraph = {
  people: [
    { id: "dad", displayName: "Dad", relationshipLabels: ["father"] },
    { id: "child", displayName: "Alex", relationshipLabels: ["child"] },
  ],
  relationships: [
    { id: "r1", fromPersonId: "dad", toPersonId: "child", label: "son", confidence: 0.98, sourceIds: ["family"] },
  ],
  sources: [],
  memories: [{
    id: "memory:1",
    subjectPersonId: "dad",
    title: "Fishing trip",
    summary: "Dad went fishing with Alex.",
    participantIds: ["dad", "child"],
    evidence: [{ id: "e1", sourceId: "photo:1", kind: "photo", confidence: 0.95 }],
    knowledgeState: "known",
    confidence: 0.94,
    visibility: "family",
    tags: ["fishing"],
    createdAt: "2026-08-11T00:00:00Z",
    updatedAt: "2026-08-11T00:00:00Z",
  }],
};

describe("grounded Echo response", () => {
  it("returns evidence and disclosure metadata with the response", () => {
    const response = buildGroundedResponse("I remember that fishing trip.", {
      viewerPersonId: "child",
      subjectPersonId: "dad",
      query: "remember fishing",
    }, graph);

    expect(response.matches).toHaveLength(1);
    expect(response.disclosure.knowledgeState).toBe("known");
    expect(response.disclosure.evidenceCount).toBe(1);
  });

  it("returns unknown when the viewer is not authorized", () => {
    const response = buildGroundedResponse("I don't have enough verified information to answer that.", {
      viewerPersonId: "stranger",
      subjectPersonId: "dad",
      query: "remember fishing",
    }, graph);

    expect(response.matches).toHaveLength(0);
    expect(response.disclosure.knowledgeState).toBe("unknown");
    expect(response.disclosure.confidence).toBe(0);
  });
});
