import { describe, expect, it } from "vitest";
import { baselineExtractor, commitCandidateMemory } from "./extraction.js";
import type { IngestionRecord } from "./ingestion.js";
import type { MemoryGraph } from "./model.js";

const graph: MemoryGraph = { people: [], relationships: [], sources: [], memories: [] };
const record: IngestionRecord = {
  source: {
    id: "photo:fishing",
    kind: "photo",
    title: "Dad fishing at Smith Mountain Lake",
    importedAt: "2026-08-11T00:00:00Z",
    capturedAt: "2004-07-04T15:00:00Z",
  },
  provenance: {
    sourceId: "photo:fishing",
    importedAt: "2026-08-11T00:00:00Z",
    capturedAt: "2004-07-04T15:00:00Z",
    extractionVersion: "echo-ingestion-v1",
  },
};

describe("extraction boundary", () => {
  it("provides deterministic baseline entities without claiming a memory", () => {
    const result = baselineExtractor.extract(record);
    expect(result.sourceId).toBe("photo:fishing");
    expect(result.entities.map((entity) => entity.value)).toEqual([
      "dad",
      "fishing",
      "smith",
      "mountain",
      "lake",
    ]);
    expect(result.candidate).toBeUndefined();
  });

  it("commits only an explicit candidate and preserves source evidence", () => {
    const result = baselineExtractor.extract(record);
    const graphWithMemory = commitCandidateMemory(graph, record, {
      ...result,
      candidate: {
        title: "Fishing at Smith Mountain Lake",
        summary: "Dad fishing at Smith Mountain Lake.",
        subjectPersonId: "dad",
        participantIds: ["dad"],
        tags: ["fishing", "lake"],
        confidence: 0.91,
        knowledgeState: "known",
      },
    });

    expect(graphWithMemory.memories).toHaveLength(1);
    expect(graphWithMemory.memories[0]?.evidence[0]?.sourceId).toBe("photo:fishing");
    expect(graphWithMemory.memories[0]?.visibility).toBe("private");
  });
});
