import { describe, expect, it } from "vitest";
import { orchestrateEcho } from "./orchestrator.js";
import type { MemoryGraph } from "../memory/model.js";

const consent = {
  enabled: true,
  scope: ["scene" as const],
  grantedBy: "dad",
  grantedAt: "2026-08-11T00:00:00Z",
};

const graph: MemoryGraph = {
  people: [
    { id: "dad", displayName: "Dad", relationshipLabels: [] },
    { id: "child", displayName: "Child", relationshipLabels: [] },
  ],
  relationships: [],
  sources: [
    { id: "photo:fishing", kind: "photo", title: "Fishing", importedAt: "2026-08-11T00:00:00Z" },
  ],
  memories: [
    {
      id: "memory:fishing",
      subjectPersonId: "dad",
      title: "Fishing at the lake",
      summary: "Dad fishing at the lake.",
      participantIds: ["child"],
      evidence: [{ id: "e:1", sourceId: "photo:fishing", kind: "photo", confidence: 0.98 }],
      knowledgeState: "known",
      confidence: 0.98,
      visibility: "family",
      tags: ["fishing", "lake"],
      createdAt: "2026-08-11T00:00:00Z",
      updatedAt: "2026-08-11T00:00:00Z",
    },
  ],
};

describe("Echo orchestration", () => {
  it("retrieves grounded memory and creates an authorized experience", () => {
    const result = orchestrateEcho(graph, {
      viewerPersonId: "child",
      subjectPersonId: "dad",
      relationship: "child",
      query: "Remember when Dad went fishing at the lake?",
      consent,
    });

    expect(result.response.disclosure.knowledgeState).toBe("known");
    expect(result.response.matches[0]?.memory.id).toBe("memory:fishing");
    expect(result.experience?.memoryId).toBe("memory:fishing");
  });

  it("returns unknown when evidence does not match the question", () => {
    const result = orchestrateEcho(graph, {
      viewerPersonId: "child",
      subjectPersonId: "dad",
      query: "What did Dad eat in Paris?",
      consent,
    });
    expect(result.response.disclosure.knowledgeState).toBe("unknown");
    expect(result.experience).toBeUndefined();
  });
});
