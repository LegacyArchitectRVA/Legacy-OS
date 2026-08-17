import { describe, expect, it } from "vitest";
import { matchIdentity } from "./identity.js";
import type { MemoryGraph } from "./model.js";

const graph: MemoryGraph = {
  people: [
    { id: "dad", displayName: "Robert Rothchild", relationshipLabels: ["father", "Bob"] },
    { id: "mom", displayName: "Jane Rothchild", relationshipLabels: ["mother", "Mom"] },
    { id: "meemaw", displayName: "Evelyn Rothchild", relationshipLabels: ["grandmother"] },
    { id: "sis", displayName: "Sarah Rothchild", relationshipLabels: ["sister"] },
  ],
  relationships: [],
  sources: [],
  memories: [],
};

describe("identity resolution", () => {
  it("matches normalized personal aliases exactly", () => {
    const matches = matchIdentity(graph, {
      value: "  BOB ",
      sourceId: "message:1",
      confidence: 0.95,
      type: "name",
    });
    expect(matches[0]).toMatchObject({ personId: "dad", score: 0.95 });
  });

  it("accepts common father nicknames through the father relationship", () => {
    for (const value of ["Dad", "Papa", "Papi", "Pops", "Daddy", "Pa"]) {
      expect(matchIdentity(graph, {
        value,
        sourceId: `message:${value}`,
        confidence: 0.95,
        type: "relationship-label",
      })[0]?.personId).toBe("dad");
    }
  });

  it("accepts common mother, grandmother, and sister nicknames", () => {
    expect(matchIdentity(graph, {
      value: "Momma",
      sourceId: "message:momma",
      confidence: 0.95,
      type: "relationship-label",
    })[0]?.personId).toBe("mom");
    expect(matchIdentity(graph, {
      value: "Meemaw",
      sourceId: "message:meemaw",
      confidence: 0.95,
      type: "relationship-label",
    })[0]?.personId).toBe("meemaw");
    expect(matchIdentity(graph, {
      value: "Sis",
      sourceId: "message:sis",
      confidence: 0.95,
      type: "relationship-label",
    })[0]?.personId).toBe("sis");
  });

  it("does not create an identity from weak evidence", () => {
    expect(matchIdentity(graph, {
      value: "Robert",
      sourceId: "message:2",
      confidence: 0.6,
      type: "name",
    })).toEqual([]);
  });

  it("does not fuzzy-match an unrelated name", () => {
    expect(matchIdentity(graph, {
      value: "Roberto",
      sourceId: "message:3",
      confidence: 0.99,
      type: "name",
    })).toEqual([]);
  });
});
