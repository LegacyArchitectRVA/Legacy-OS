import { describe, expect, it } from "vitest";
import type { MemoryGraph } from "./model.js";
import { createEchoResponse } from "./echo.js";

const graph: MemoryGraph = {
  people: [
    { id: "dad", displayName: "Dad", relationshipLabels: ["father"] },
    { id: "sarah", displayName: "Sarah", relationshipLabels: ["daughter"] },
  ],
  relationships: [
    {
      id: "r1",
      fromPersonId: "dad",
      toPersonId: "sarah",
      label: "father",
      confidence: 1,
      sourceIds: ["s1"],
    },
  ],
  sources: [
    {
      id: "s1",
      kind: "photo",
      title: "Fishing trip",
      importedAt: "2026-08-01T00:00:00Z",
    },
    {
      id: "s2",
      kind: "video",
      title: "Fishing video",
      importedAt: "2026-08-01T00:00:00Z",
    },
  ],
  memories: [
    {
      id: "m1",
      subjectPersonId: "dad",
      title: "Fishing at Smith Mountain Lake",
      summary: "I remember our fishing trip at Smith Mountain Lake. You were convinced you would catch the biggest fish.",
      occurredAt: "2004-07-18T00:00:00Z",
      location: "Smith Mountain Lake",
      participantIds: ["dad", "sarah"],
      evidence: [
        { id: "e1", sourceId: "s1", kind: "photo", confidence: 1 },
        { id: "e2", sourceId: "s2", kind: "video", confidence: 0.95 },
      ],
      knowledgeState: "known",
      confidence: 0.98,
      visibility: "family",
      tags: ["fishing", "lake", "childhood"],
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-01T00:00:00Z",
    },
  ],
};

describe("Echo", () => {
  it("creates a grounded memory experience with source media", () => {
    const response = createEchoResponse(graph, {
      viewerPersonId: "sarah",
      subjectPersonId: "dad",
      query: "Do you remember fishing at Smith Mountain Lake?",
      persona: { displayName: "Dad", relationshipLabel: "father" },
    });

    expect(response.experience.mode).toBe("grounded-memory");
    expect(response.experience.memoryId).toBe("m1");
    expect(response.experience.mediaSourceIds).toEqual(["s1", "s2"]);
    expect(response.disclosure.knowledgeState).toBe("known");
    expect(response.disclosure.confidence).toBe(0.98);
  });

  it("refuses to invent a memory when evidence is absent", () => {
    const response = createEchoResponse(graph, {
      viewerPersonId: "sarah",
      subjectPersonId: "dad",
      query: "What happened on our trip to Mars?",
      persona: { displayName: "Dad" },
    });

    expect(response.experience.mode).toBe("insufficient-evidence");
    expect(response.experience.memoryId).toBeUndefined();
    expect(response.disclosure.knowledgeState).toBe("unknown");
  });
});
