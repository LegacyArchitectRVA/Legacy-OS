import { describe, expect, it } from "vitest";
import { resolveIdentityObservation } from "./identity-pipeline.js";
import type { MemoryGraph } from "./model.js";

const graph: MemoryGraph = {
  people: [
    { id: "dad", displayName: "Robert Rothchild", relationshipLabels: ["father"] },
    { id: "mom", displayName: "Jane Rothchild", relationshipLabels: ["mother"] },
  ],
  relationships: [],
  sources: [],
  memories: [],
};

describe("identity resolution pipeline", () => {
  it("returns unresolved instead of creating a person", () => {
    const result = resolveIdentityObservation(graph, {
      value: "Roberto",
      sourceId: "message:1",
      confidence: 0.99,
      type: "name",
    });
    expect(result.status).toBe("unresolved");
    expect(result.matches).toEqual([]);
    expect(result.graph).toBeUndefined();
  });

  it("returns matched for strong evidence", () => {
    const result = resolveIdentityObservation(graph, {
      value: "Robert Rothchild",
      sourceId: "message:2",
      confidence: 0.99,
      type: "name",
    });
    expect(result.status).toBe("matched");
    expect(result.matches[0]?.personId).toBe("dad");
  });
});
