import { describe, expect, it } from "vitest";
import { rankEvidence } from "./evidence-ranking.js";

describe("evidence ranking", () => {
  it("ranks original itemized receipts above weak social evidence", () => {
    const ranked = rankEvidence([
      { id: "social:1", kind: "social", confidence: 0.9, original: false },
      { id: "receipt:1", kind: "receipt", confidence: 0.95, original: true, sourceHash: "sha256:x" },
    ]);

    expect(ranked[0]?.id).toBe("receipt:1");
    expect(ranked[0]?.reliability).toBe("primary");
  });

  it("keeps weak evidence available without treating it as fact", () => {
    const ranked = rankEvidence([
      { id: "note:1", kind: "note", confidence: 0.3, original: false },
    ]);

    expect(ranked[0]?.reliability).toBe("weak");
  });
});
