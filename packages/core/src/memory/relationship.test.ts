import { describe, expect, it } from "vitest";
import { canCreateRelationship, createRelationship, getRelationshipLabel, matchRelationship } from "./relationship.js";
import type { MemoryGraph } from "./model.js";

const graph: MemoryGraph = {
  people: [
    { id: "dad", displayName: "Dad", relationshipLabels: ["father"] },
    { id: "child", displayName: "Alex", relationshipLabels: ["child"] },
  ],
  relationships: [
    { id: "r1", fromPersonId: "child", toPersonId: "dad", label: "father", confidence: 0.97, sourceIds: ["source:1"] },
  ],
  sources: [],
  memories: [],
};

describe("relationship resolution", () => {
  it("matches an existing relationship only with strong evidence", () => {
    const matches = matchRelationship(graph, {
      fromPersonId: "child",
      toPersonId: "dad",
      label: " Father ",
      sourceId: "source:2",
      confidence: 0.95,
    });
    expect(matches[0]?.relationshipId).toBe("r1");
  });

  it("does not create a relationship from weak evidence", () => {
    expect(canCreateRelationship({
      fromPersonId: "child",
      toPersonId: "dad",
      label: "father",
      sourceId: "source:3",
      confidence: 0.89,
    })).toBe(false);
  });

  it("creates a high-confidence relationship and preserves provenance", () => {
    const next = createRelationship(graph, {
      fromPersonId: "dad",
      toPersonId: "child",
      label: "son",
      sourceId: "source:4",
      confidence: 0.94,
    });
    expect(next.relationships).toHaveLength(2);
    expect(getRelationshipLabel(next, "dad", "child")).toBe("son");
  });
});
