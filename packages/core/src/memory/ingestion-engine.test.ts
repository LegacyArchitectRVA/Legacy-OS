import { describe, expect, it } from "vitest";
import { ingestSource } from "./ingestion-engine.js";

describe("raw source ingestion engine", () => {
  it("extracts text while preserving source provenance", () => {
    const result = ingestSource({
      id: "receipt:1",
      filename: "restaurant-receipt.pdf",
      mimeType: "application/pdf",
      importedAt: "2026-08-12T12:00:00Z",
      contentHash: "sha256:receipt",
      text: "Restaurant: Example Grill\nTotal: $63.42",
    });

    expect(result.warnings).toEqual([]);
    expect(result.facts[0]).toMatchObject({
      sourceId: "receipt:1",
      kind: "document",
      field: "text",
      confidence: 1,
    });
  });

  it("reports unsupported binary extraction instead of pretending it parsed it", () => {
    const result = ingestSource({
      id: "video:1",
      filename: "fishing.mp4",
      mimeType: "video/mp4",
      importedAt: "2026-08-12T12:00:00Z",
      uri: "vault://video/1",
    });

    expect(result.facts).toEqual([]);
    expect(result.warnings[0]).toContain("video/mp4");
  });
});
