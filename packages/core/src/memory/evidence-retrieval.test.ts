import { describe, expect, it } from "vitest";
import { answerFromEvidence } from "./evidence-retrieval.js";
import type { MemoryGraph } from "./model.js";

const base: MemoryGraph = {
  people: [{ id: "dad", displayName: "Dad", relationshipLabels: ["father"] }],
  relationships: [],
  sources: [],
  memories: [],
};

describe("evidence-first retrieval", () => {
  it("can establish a restaurant visit without inventing an order", () => {
    const graph: MemoryGraph = {
      ...base,
      memories: [{
        id: "memory:trip",
        subjectPersonId: "dad",
        title: "Dinner during the Chicago trip",
        summary: "A bank record shows a purchase at Lou Malnati's.",
        location: "Lou Malnati's",
        participantIds: ["dad"],
        evidence: [{
          id: "evidence:bank",
          sourceId: "bank:2024-06",
          kind: "document",
          excerpt: "LOU MALNATI'S 06/14 $48.32",
          confidence: 0.99,
        }],
        knowledgeState: "known",
        confidence: 0.99,
        visibility: "private",
        tags: ["Chicago", "dinner", "restaurant"],
        createdAt: "2026-08-11T00:00:00Z",
        updatedAt: "2026-08-11T00:00:00Z",
      }],
    };

    const result = answerFromEvidence(graph, "dad", "what did he eat on the Chicago trip?");
    expect(result.certainty).toBe("partial");
    expect(result.answer).toContain("Lou Malnati's");
    expect(result.answer).toContain("not enough information");
  });
});
