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
      evidence: [{ id: "e1", sourceId: "receipt", kind: "receipt", confidence: 0.9, original: true }],
      knowledgeState: "inferred", confidence: 0.9, visibility: "family", tags: [], createdAt: "2026-01-01", updatedAt: "2026-01-01",
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
});
