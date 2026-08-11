import { describe, expect, it } from "vitest";
import { runIngestPipeline } from "./ingest-pipeline.js";
import type { MemoryGraph } from "./model.js";

const graph: MemoryGraph = { people: [], relationships: [], sources: [], memories: [] };

describe("safe ingestion pipeline", () => {
  it("registers provenance before extraction and commits only an explicit candidate", async () => {
    const result = await runIngestPipeline(
      graph,
      {
        sourceId: "photo:fishing",
        kind: "photo",
        title: "Dad fishing",
        importedAt: "2026-08-11T00:00:00Z",
        contentHash: "sha256:test",
      },
      {
        id: "test-provider",
        version: "1.0.0",
        supports: ["photo"],
        async extract(record) {
          return {
            sourceId: record.source.id,
            entities: [{ type: "person", value: "Dad", confidence: 0.99 }],
            candidate: {
              title: "Dad fishing",
              summary: "Dad fishing.",
              subjectPersonId: "dad",
              participantIds: ["dad"],
              tags: ["fishing"],
              confidence: 0.92,
              knowledgeState: "known",
            },
          };
        },
      },
    );

    expect(result.graph.sources).toHaveLength(1);
    expect(result.graph.memories).toHaveLength(1);
    expect(result.graph.memories[0]?.evidence[0]?.sourceId).toBe("photo:fishing");
    expect(result.record.provenance.contentHash).toBe("sha256:test");
  });

  it("does not create a memory when extraction returns no candidate", async () => {
    const result = await runIngestPipeline(
      graph,
      {
        sourceId: "note:unclear",
        kind: "note",
        title: "Unclear note",
        importedAt: "2026-08-11T00:00:00Z",
      },
      {
        id: "conservative-provider",
        version: "1.0.0",
        supports: ["note"],
        async extract(record) {
          return { sourceId: record.source.id, entities: [] };
        },
      },
    );

    expect(result.graph.sources).toHaveLength(1);
    expect(result.graph.memories).toHaveLength(0);
  });
});
