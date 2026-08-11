import { describe, expect, it } from "vitest";
import { extractWithProvider } from "./provider.js";
import type { IngestionRecord } from "./ingestion.js";

const record: IngestionRecord = {
  source: { id: "photo:1", kind: "photo", title: "Fishing", importedAt: "2026-08-11T00:00:00Z" },
  provenance: { sourceId: "photo:1", importedAt: "2026-08-11T00:00:00Z", extractionVersion: "echo-ingestion-v1" },
};

describe("extraction provider boundary", () => {
  it("routes supported source types through the provider", async () => {
    const provider = {
      id: "test-provider",
      version: "1.0.0",
      supports: ["photo"],
      async extract(input: IngestionRecord) {
        return { sourceId: input.source.id, entities: [] };
      },
    };

    await expect(extractWithProvider(provider, record)).resolves.toEqual({
      sourceId: "photo:1",
      entities: [],
    });
  });

  it("rejects unsupported source types before provider execution", async () => {
    const provider = {
      id: "photo-only",
      version: "1.0.0",
      supports: ["photo"],
      async extract() {
        throw new Error("should not execute");
      },
    };

    await expect(
      extractWithProvider(provider, { ...record, source: { ...record.source, kind: "audio" } }),
    ).rejects.toThrow("does not support audio");
  });
});
