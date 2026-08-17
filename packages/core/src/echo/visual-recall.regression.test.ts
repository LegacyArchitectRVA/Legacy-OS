import { describe, expect, it } from "vitest";
import { decideVisualRecall } from "./visual-recall";

const video = {
  id: "video-1",
  kind: "video" as const,
  sourceUri: "memory://video-1",
  qualityScore: 0.2,
};

const scene = {
  id: "scene-1",
  kind: "scene" as const,
  sourceUri: "memory://scene-1",
  qualityScore: 0.2,
};

describe("visual recall regression coverage", () => {
  it("preserves authorized video when reconstruction is unavailable", () => {
    const result = decideVisualRecall({
      asset: video,
      requestedMode: "restore",
      informationAuthorized: true,
      reconstructionAuthorized: false,
    });

    expect(result.mode).toBe("original");
    expect(result.reason).toBe("reconstruction-not-authorized");
  });

  it("preserves authorized scenes when reconstruction has not been purchased", () => {
    const result = decideVisualRecall({
      asset: scene,
      requestedMode: "merge",
      informationAuthorized: true,
      reconstructionAuthorized: true,
      reconstructionPurchased: false,
    });

    expect(result.mode).toBe("original");
    expect(result.reason).toBe("reconstruction-unavailable");
  });

  it("never exposes holographic presentation when reconstruction authorization is absent", () => {
    const result = decideVisualRecall({
      asset: video,
      requestedMode: "holographic",
      informationAuthorized: true,
      reconstructionAuthorized: false,
      reconstructionPurchased: true,
    });

    expect(result.mode).toBe("original");
    expect(result.fallbackFrom).toBe("holographic");
  });
});
