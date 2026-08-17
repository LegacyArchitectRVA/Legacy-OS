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
  it("matches an existing relationship through an established family alias", () => {
    const matches = matchRelationship(graph, {
      fromPersonId: "child",
      toPersonId: "dad",
      label: " Dad ",
      sourceId: "source:2",
      confidence: 0.95,
    });
    expect(matches[0]).toMatchObject({ relationshipId: "r1", label: "father" });
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

  it("does not create relationships for people missing from the graph", () => {
    expect(canCreateRelationship({
      fromPersonId: "missing",
      toPersonId: "dad",
      label: "father",
      sourceId: "source:3",
      confidence: 0.99,
    }, graph)).toBe(false);

    expect(createRelationship(graph, {
      fromPersonId: "missing",
      toPersonId: "dad",
      label: "father",
      sourceId: "source:3",
      confidence: 0.99,
    })).toEqual(graph);
  });

  it("creates a high-confidence relationship, canonicalizes the label, and preserves provenance", () => {
    const next = createRelationship(graph, {
      fromPersonId: "dad",
      toPersonId: "child",
      label: "son",
      sourceId: "source:4",
      confidence: 0.94,
    });
    expect(next.relationships).toHaveLength(2);
    expect(getRelationshipLabel(next, "dad", "child")).toBe("son");
    expect(next.relationships[1]?.sourceIds).toEqual(["source:4"]);
  });

  it("deduplicates equivalent relationship aliases", () => {
    const first = createRelationship(graph, {
      fromPersonId: "dad",
      toPersonId: "child",
      label: "son",
      sourceId: "source:4",
      confidence: 0.94,
    });
    const second = createRelationship(first, {
      fromPersonId: "dad",
      toPersonId: "child",
      label: "Boy",
      sourceId: "source:5",
      confidence: 0.96,
    });
    expect(second.relationships).toHaveLength(2);
  });
});
