import { describe, expect, it } from "vitest";
import { decideVisualRecall } from "./visual-recall";

const asset = { id: "photo-1", kind: "image" as const, sourceUri: "memory://photo-1", qualityScore: 0.3 };

describe("visual recall", () => {
  it("denies when information itself is not authorized", () => {
    expect(decideVisualRecall({ asset, requestedMode: "restore", informationAuthorized: false, reconstructionAuthorized: true }).mode).toBe("denied");
  });

  it("falls back to original when reconstruction is unavailable", () => {
    const result = decideVisualRecall({ asset, requestedMode: "restore", informationAuthorized: true, reconstructionAuthorized: true, reconstructionPurchased: false });
    expect(result.mode).toBe("original");
    expect(result.fallbackFrom).toBe("restore");
  });

  it("permits holographic presentation only when authorized and available", () => {
    expect(decideVisualRecall({ asset, requestedMode: "holographic", informationAuthorized: true, reconstructionAuthorized: true, reconstructionPurchased: true }).mode).toBe("holographic");
  });

  it("keeps high-quality originals intact", () => {
    const result = decideVisualRecall({ asset: { ...asset, qualityScore: 0.95 }, requestedMode: "restore", informationAuthorized: true, reconstructionAuthorized: true });
    expect(result.mode).toBe("original");
  });
});
