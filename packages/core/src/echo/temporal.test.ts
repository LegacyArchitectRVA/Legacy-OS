import { describe, expect, it } from "vitest";
import { clusterTemporalEvidence, evidenceFallsWithinWindow } from "./temporal.js";

describe("temporal evidence", () => {
  it("clusters sources from the same trip window", () => {
    const clusters = clusterTemporalEvidence([
      { sourceId: "receipt:1", capturedAt: "2025-06-14T18:00:00Z", place: "Chicago" },
      { sourceId: "photo:1", capturedAt: "2025-06-15T14:00:00Z", place: "Chicago" },
      { sourceId: "message:1", capturedAt: "2025-06-30T14:00:00Z", place: "Chicago" },
    ]);

    expect(clusters).toHaveLength(2);
    expect(clusters[0]?.sourceIds).toEqual(["receipt:1", "photo:1"]);
  });

  it("does not chain a later event through an earlier cluster", () => {
    const clusters = clusterTemporalEvidence([
      { sourceId: "a", capturedAt: "2025-06-01T00:00:00Z", place: "Chicago" },
      { sourceId: "b", capturedAt: "2025-06-03T00:00:00Z", place: "Chicago" },
      { sourceId: "c", capturedAt: "2025-06-05T00:00:00Z", place: "Chicago" },
    ], 2);

    expect(clusters).toHaveLength(2);
    expect(clusters[0]?.sourceIds).toEqual(["a", "b"]);
    expect(clusters[1]?.sourceIds).toEqual(["c"]);
  });

  it("rejects an invalid clustering window", () => {
    expect(() => clusterTemporalEvidence([], -1)).toThrow("windowDays");
  });

  it("checks an evidence item against an explicit event window", () => {
    expect(
      evidenceFallsWithinWindow(
        { sourceId: "receipt:1", capturedAt: "2025-06-15T12:00:00Z" },
        "2025-06-14T00:00:00Z",
        "2025-06-16T23:59:59Z",
      ),
    ).toBe(true);
  });
});
