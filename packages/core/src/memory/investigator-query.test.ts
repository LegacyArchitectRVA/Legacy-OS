import { describe, expect, it } from "vitest";
import { resolveInvestigatorQuery } from "./investigator-query.js";

const graph = {
  people: [
    { id: "viewer", displayName: "Alex", relationshipLabels: [] },
    { id: "dad", displayName: "Robert", relationshipLabels: ["father"] },
    { id: "grandma", displayName: "Mary", relationshipLabels: ["grandmother"] },
    { id: "sis", displayName: "Sarah", relationshipLabels: ["sister"] },
  ],
  relationships: [
    { id: "r1", fromPersonId: "viewer", toPersonId: "dad", label: "father", confidence: 0.95, sourceIds: ["family"] },
    { id: "r2", fromPersonId: "viewer", toPersonId: "grandma", label: "grandmother", confidence: 0.95, sourceIds: ["family"] },
    { id: "r3", fromPersonId: "viewer", toPersonId: "sis", label: "sister", confidence: 0.95, sourceIds: ["family"] },
  ],
  sources: [],
  memories: [
    {
      id: "m1", subjectPersonId: "dad", title: "Dinner", summary: "Robert ate at Example Grill.", participantIds: [],
      evidence: [
        { id: "e1", sourceId: "receipt", kind: "receipt", confidence: 0.95, original: true },
        { id: "e2", sourceId: "bank", kind: "financial-transaction", confidence: 0.92, original: true },
      ],
      knowledgeState: "known", confidence: 0.9, visibility: "family", tags: [], createdAt: "2026-01-01", updatedAt: "2026-01-01",
    },
  ],
};

describe("relationship-aware investigator queries", () => {
  it.each([
    ["dad", "dad"], ["pops", "dad"], ["papi", "dad"],
    ["Meemaw", "grandma"], ["nana", "grandma"],
    ["sis", "sis"], ["sissy", "sis"],
  ])("resolves %s through the relationship graph", (reference, expected) => {
    const result = resolveInvestigatorQuery(graph, "viewer", `What did ${reference} eat?`);
    expect(result.subject?.person.id).toBe(expected);
  });

  it("refuses an equally confident ambiguous reference", () => {
    const ambiguousGraph = {
      ...graph,
      people: [...graph.people, { id: "other-parent", displayName: "Pat", relationshipLabels: ["father"] }],
      relationships: [...graph.relationships,
        { id: "r4", fromPersonId: "viewer", toPersonId: "other-parent", label: "father", confidence: 0.95, sourceIds: ["family-2"] }],
    };
    const result = resolveInvestigatorQuery(ambiguousGraph, "viewer", "What did Pops eat?");
    expect(result.ambiguous).toBe(true);
    expect(result.knowledgeState).toBe("unknown");
  });
});
