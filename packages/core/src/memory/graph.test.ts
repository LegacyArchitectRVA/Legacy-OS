import { describe, expect, it } from "vitest";
import { buildMemoryResponse, queryMemories, relationshipBetween } from "./graph.js";
import type { MemoryGraph } from "./model.js";

const graph: MemoryGraph = {
  people: [
    { id: "dad", displayName: "Dad", relationshipLabels: [] },
    { id: "sarah", displayName: "Sarah", relationshipLabels: ["daughter"] },
  ],
  relationships: [
    {
      id: "rel-1",
      fromPersonId: "dad",
      toPersonId: "sarah",
      label: "daughter",
      confidence: 1,
      sourceIds: ["src-1"],
    },
  ],
  sources: [
    {
      id: "src-1",
      kind: "photo",
      title: "Fishing trip photo",
      capturedAt: "2004-06-15",
      importedAt: "2026-08-08T00:00:00Z",
    },
    {
      id: "src-2",
      kind: "note",
      title: "Dad's fishing note",
      capturedAt: "2004-06-16",
      importedAt: "2026-08-08T00:00:00Z",
    },
  ],
  memories: [
    {
      id: "memory-1",
      subjectPersonId: "dad",
      title: "Fishing at Smith Mountain Lake",
      summary: "I remember taking you fishing at Smith Mountain Lake, when you were convinced you would catch the biggest fish.",
      occurredAt: "2004-06-15",
      location: "Smith Mountain Lake",
      participantIds: ["sarah"],
      evidence: [
        { id: "ev-1", sourceId: "src-1", kind: "photo", confidence: 0.99 },
        { id: "ev-2", sourceId: "src-2", kind: "note", confidence: 0.95 },
      ],
      knowledgeState: "known",
      confidence: 0.97,
      visibility: "family",
      tags: ["fishing", "lake", "childhood"],
      createdAt: "2026-08-08T00:00:00Z",
      updatedAt: "2026-08-08T00:00:00Z",
    },
  ],
};

describe("memory graph", () => {
  it("resolves the viewer's relationship to the subject", () => {
    expect(relationshipBetween(graph, "sarah", "dad")?.label).toBe("daughter");
  });

  it("ranks relationship-relevant evidence-backed memories", () => {
    const matches = queryMemories(graph, {
      viewerPersonId: "sarah",
      subjectPersonId: "dad",
      query: "fishing lake",
    });

    expect(matches).toHaveLength(1);
    expect(matches[0].memory.id).toBe("memory-1");
    expect(matches[0].matchedEvidence).toHaveLength(2);
    expect(matches[0].relationshipRelevance).toBe(1);
  });

  it("returns an explicit evidence disclosure with the answer", () => {
    const response = buildMemoryResponse(graph, {
      viewerPersonId: "sarah",
      subjectPersonId: "dad",
      query: "Do you remember fishing?",
    });

    expect(response.answer).toContain("daughter");
    expect(response.disclosure.knowledgeState).toBe("known");
    expect(response.disclosure.confidence).toBe(0.97);
    expect(response.disclosure.evidenceCount).toBe(2);
  });

  it("does not invent an answer when there is no matching evidence", () => {
    const response = buildMemoryResponse(graph, {
      viewerPersonId: "sarah",
      subjectPersonId: "dad",
      query: "moon landing ceremony",
    });

    expect(response.disclosure.knowledgeState).toBe("unknown");
    expect(response.answer).toContain("not enough evidence");
  });
});
