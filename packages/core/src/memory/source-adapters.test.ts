import { describe, expect, it } from "vitest";
import { createMediaAdapter, createTextAdapter } from "./source-adapters.js";

describe("source adapters", () => {
  it("normalizes text sources without losing original metadata", () => {
    const adapter = createTextAdapter("message");
    expect(
      adapter.normalize({
        id: "msg:1",
        title: "Fishing plans",
        text: "Meet at the lake Saturday.",
        importedAt: "2026-08-11T00:00:00Z",
        ownerPersonId: "dad",
        contentHash: "sha256:1",
      }),
    ).toEqual({
      sourceId: "msg:1",
      kind: "message",
      title: "Fishing plans",
      importedAt: "2026-08-11T00:00:00Z",
      ownerPersonId: "dad",
      contentHash: "sha256:1",
      text: "Meet at the lake Saturday.",
    });
  });

  it("normalizes media sources into the common ingestion contract", () => {
    const adapter = createMediaAdapter("video");
    const normalized = adapter.normalize({
      id: "video:1",
      title: "Fishing trip",
      uri: "vault://video/1",
      importedAt: "2026-08-11T00:00:00Z",
    });

    expect(normalized.kind).toBe("video");
    expect(normalized.uri).toBe("vault://video/1");
  });
});
