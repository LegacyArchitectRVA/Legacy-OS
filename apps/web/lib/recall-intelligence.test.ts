import { describe, expect, it } from "vitest";
import { assessRecallIntelligence } from "./recall-intelligence";

describe("assessRecallIntelligence", () => {
  it("flags unknown memories for verification", () => {
    const result = assessRecallIntelligence({ evidenceClass: "unknown", confidence: undefined, sourceRefs: [], narrative: "Unconfirmed" });
    expect(result.needsVerification).toBe(true);
  });

  it("flags inferred memories for verification", () => {
    const result = assessRecallIntelligence({ evidenceClass: "inferred", confidence: 0.7, sourceRefs: ["note:1"], narrative: "Likely happened." });
    expect(result.needsVerification).toBe(true);
  });

  it("requires sources for known memories", () => {
    const result = assessRecallIntelligence({ evidenceClass: "known", confidence: undefined, sourceRefs: [], narrative: "Documented event." });
    expect(result.confidence).toBe(1);
    expect(result.needsVerification).toBe(true);
  });

  it("clamps confidence to the supported range", () => {
    expect(assessRecallIntelligence({ evidenceClass: "known", confidence: 4, sourceRefs: ["doc:1"], narrative: "Documented event." }).confidence).toBe(1);
    expect(assessRecallIntelligence({ evidenceClass: "known", confidence: -2, sourceRefs: ["doc:1"], narrative: "Documented event." }).confidence).toBe(0);
  });
});
