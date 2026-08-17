import { describe, expect, it } from "vitest";
import {
  chooseDisplayVariant,
  createVisualDisplayPlan,
  decideVisualDisplay,
  type MediaSource,
} from "./media.js";

const oldPhoto: MediaSource = {
  id: "photo-1",
  kind: "image",
  uri: "media://photo-1",
  qualityScore: 0.3,
  provenance: "uploaded",
};

const clearPhoto: MediaSource = {
  ...oldPhoto,
  id: "photo-2",
  uri: "media://photo-2",
  qualityScore: 0.9,
};

describe("Echo visual media", () => {
  it("supports original, merge, and restore selectors for degraded media", () => {
    expect(chooseDisplayVariant(oldPhoto, "original")).toBe("original");
    expect(chooseDisplayVariant(oldPhoto, "merge")).toBe("merge");
    expect(chooseDisplayVariant(oldPhoto, "restore")).toBe("restore");
  });

  it("keeps high-quality media on the original variant", () => {
    expect(chooseDisplayVariant(clearPhoto, "merge")).toBe("original");
    expect(chooseDisplayVariant(clearPhoto, "restore")).toBe("original");
  });

  it("falls back to the original when a paid reconstruction is unavailable", () => {
    const plan = createVisualDisplayPlan("photo-1", "restore", "holographic");
    const decision = decideVisualDisplay(oldPhoto, {
      ...plan,
      reconstructionEnabled: true,
      reconstructionEntitlement: "unavailable",
    });

    expect(decision.allowed).toBe(true);
    expect(decision.variant).toBe("original");
    expect(decision.mode).toBe("holographic");
    expect(decision.fallback).toBe("original");
    expect(decision.reason).toBe("reconstruction-unavailable");
  });

  it("uses a historical snapshot when the selected snapshot exists", () => {
    const plan = {
      ...createVisualDisplayPlan("photo-1", "original"),
      historicalSnapshotId: "earth-2008",
    };

    const decision = decideVisualDisplay(oldPhoto, plan, {
      id: "earth-2008",
      sourceId: "photo-1",
      capturedAt: "2008-06-01T00:00:00Z",
      provider: "google-earth",
      uri: "history://earth-2008",
      confidence: 0.98,
    });

    expect(decision.allowed).toBe(true);
    expect(decision.reason).toBe("authorized");
  });

  it("does not block the original when a historical snapshot is unavailable", () => {
    const plan = {
      ...createVisualDisplayPlan("photo-1", "merge"),
      historicalSnapshotId: "missing",
    };

    const decision = decideVisualDisplay(oldPhoto, plan);
    expect(decision.allowed).toBe(true);
    expect(decision.variant).toBe("original");
    expect(decision.fallback).toBe("original");
    expect(decision.reason).toBe("historical-snapshot-unavailable");
  });
});
