import { describe, expect, it } from "vitest";
import { buildFactualConclusion } from "./investigative-conclusion.js";

describe("factual conclusions", () => {
  it("explains when a claim is supported by primary evidence", () => {
    const result = buildFactualConclusion({
      claim: "Dad ordered a steak.",
      evidence: [
        { id: "receipt:1", kind: "receipt", confidence: 0.98, original: true, sourceHash: "sha256:1" },
        { id: "bank:1", kind: "bank", confidence: 0.95, original: true },
      ],
    });

    expect(result.strength).toBe("corroborated");
    expect(result.explanation).toContain("primary source");
  });

  it("does not overstate a weak source", () => {
    const result = buildFactualConclusion({
      claim: "Dad ate at the restaurant.",
      evidence: [{ id: "social:1", kind: "social", confidence: 0.5, original: false }],
    });

    expect(result.strength).toBe("partial");
    expect(result.explanation).toContain("none qualify as primary evidence");
  });
});
