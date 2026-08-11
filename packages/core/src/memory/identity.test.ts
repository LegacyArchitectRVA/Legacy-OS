import { describe, expect, it } from "vitest";
import { matchIdentity } from "./identity.js";
import type { MemoryGraph } from "./model.js";

const graph: MemoryGraph = {
  people: [
    { id: "dad", name: "Robert Rothchild", aliases: ["Bob"] },
    { id: "mom", name: "Jane Rothchild", aliases: ["Mom"] },
  ],
  relationships: [],
  sources: [],
  memories: [],
};

describe("identity resolution", () => {
  it("matches normalized aliases exactly", () => {
    const matches = matchIdentity(graph, {
      value: "  BOB ",
      sourceId: "message:1",
      confidence: 0.95,
      type: "name",
    });
    expect(matches[0]).toMatchObject({ personId: "dad", score: 0.95 });
  });

  it("does not create an identity from weak evidence", () => {
    expect(
      matchIdentity(graph, {
        value: "Robert",
        sourceId: "message:2",
        confidence: 0.6,
        type: "name",
      }),
    ).toEqual([]);
  });

  it("does not fuzzy-match an unrelated name", () => {
    expect(
      matchIdentity(graph, {
        value: "Roberto",
        sourceId: "message:3",
        confidence: 0.99,
        type: "name",
      }),
    ).toEqual([]);
  });
});
