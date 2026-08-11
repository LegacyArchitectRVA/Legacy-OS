import { describe, expect, it } from "vitest";
import { ingestSource } from "./ingestion.js";
import type { MemoryGraph } from "./model.js";

const emptyGraph: MemoryGraph = { people: [], relationships: [], sources: [], memories: [] };

describe("provenance-first ingestion", () => {
  it("stores the original source and provenance without inventing a memory", () => {
    const result = ingestSource(emptyGraph, {
      sourceId: "photo:2004",
      kind: "photo",
      title: "Dad and the boat",
      importedAt: "2026-08-11T00:00:00Z",
      capturedAt: "2004-07-04T15:00:00Z",
      contentHash: "sha256:abc",
      ownerPersonId: "dad",
    });

    expect(result.graph.sources).toHaveLength(1);
    expect(result.graph.memories).toHaveLength(0);
    expect(result.record.provenance.sourceId).toBe("photo:2004");
    expect(result.record.provenance.extractionVersion).toBe("echo-ingestion-v1");
  });

  it("rejects duplicate source identifiers", () => {
    const first = ingestSource(emptyGraph, {
      sourceId: "note:1",
      kind: "note",
      title: "Fishing note",
      importedAt: "2026-08-11T00:00:00Z",
    });

    expect(() =>
      ingestSource(first.graph, {
        sourceId: "note:1",
        kind: "note",
        title: "Duplicate",
        importedAt: "2026-08-11T00:01:00Z",
      }),
    ).toThrow("Duplicate source id: note:1");
  });
});
