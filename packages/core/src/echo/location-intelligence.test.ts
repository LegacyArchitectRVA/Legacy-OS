import { describe, expect, it } from "vitest";
import { resolveLocation } from "./location-intelligence.js";

describe("location intelligence", () => {
  it("combines coordinate-bearing evidence without inventing a place", () => {
    const result = resolveLocation([
      { sourceId: "photo:1", kind: "photo-metadata", latitude: 37.123, longitude: -79.456, confidence: 0.9 },
      { sourceId: "gps:1", kind: "gps", latitude: 37.124, longitude: -79.455, placeText: "Smith Mountain Lake", confidence: 0.99 },
    ]);

    expect(result?.placeText).toBe("Smith Mountain Lake");
    expect(result?.latitude).toBeCloseTo(37.1239, 3);
    expect(result?.sourceIds).toEqual(["photo:1", "gps:1"]);
  });

  it("records uncertainty when location is text-only", () => {
    const result = resolveLocation([
      { sourceId: "receipt:1", kind: "receipt", placeText: "Example Grill, Chicago", confidence: 0.8 },
    ]);

    expect(result?.latitude).toBeUndefined();
    expect(result?.limitations[0]).toContain("text rather than coordinates");
  });
});
