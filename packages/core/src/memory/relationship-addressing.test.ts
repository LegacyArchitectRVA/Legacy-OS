import { describe, expect, it } from "vitest";
import { relationshipAliases, resolveRelationshipAddress } from "./relationship-addressing.js";
import type { MemoryGraph } from "./model.js";

const graph = (label: string): MemoryGraph => ({
  people: [
    { id: "viewer", displayName: "Alex", relationshipLabels: [] },
    { id: "subject", displayName: "Maria", relationshipLabels: [label] },
  ],
  relationships: [{
    id: "rel-1", fromPersonId: "viewer", toPersonId: "subject", label,
    confidence: 0.95, sourceIds: ["family-record"],
  }],
  sources: [], memories: [],
});

describe("relationship-aware addressing", () => {
  it.each([
    ["father", ["dad", "papa", "papi", "pops", "daddy"]],
    ["mother", ["mom", "momma", "mama", "mommy"]],
    ["sister", ["sis", "sissy"]],
    ["brother", ["bro"]],
    ["grandmother", ["grandma", "granny", "meemaw", "memaw"]],
    ["grandfather", ["grandpa", "gramps", "papaw"]],
    ["aunt", ["auntie"]],
    ["uncle", ["unk"]],
    ["cousin", ["cuz"]],
    ["wife", ["wifey"]],
    ["husband", ["hubby"]],
  ])("resolves common aliases for %s", (label, aliases) => {
    for (const alias of aliases) {
      expect(resolveRelationshipAddress(graph(label), "viewer", alias)[0]?.person.id).toBe("subject");
    }
  });

  it("accepts the person's actual display name", () => {
    expect(resolveRelationshipAddress(graph("mother"), "viewer", "Maria")[0]?.person.id).toBe("subject");
  });

  it("does not resolve an unrelated relationship alias", () => {
    expect(resolveRelationshipAddress(graph("mother"), "viewer", "Pops")).toEqual([]);
  });

  it("exposes the full alias vocabulary for a relationship", () => {
    expect(relationshipAliases("grandmother")).toContain("meemaw");
  });
});
