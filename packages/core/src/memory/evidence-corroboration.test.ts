import { describe, expect, it } from "vitest";
import { corroborate } from "./evidence-corroboration.js";

const evidence = (id: string, sourceId: string, confidence: number) => ({
  id,
  sourceId,
  kind: "document" as const,
  confidence,
  original: true,
});

describe("evidence corroboration", () => {
  it("promotes high-confidence independent sources to known", () => {
    const result = corroborate({
      statement: "He ate at Example Grill.",
      evidence: [evidence("e1", "receipt-1", 0.95), evidence("e2", "bank-1", 0.92)],
    });

    expect(result.knowledgeState).toBe("known");
    expect(result.independentSourceCount).toBe(2);
    expect(result.evidenceIds).toEqual(["e1", "e2"]);
  });

  it("keeps a single source from being presented as corroborated fact", () => {
    const result = corroborate({
      statement: "He ate at Example Grill.",
      evidence: [evidence("e1", "receipt-1", 0.95)],
    });

    expect(result.knowledgeState).toBe("inferred");
    expect(result.independentSourceCount).toBe(1);
    expect(result.gaps).toContain("Only one independent source supports this finding.");
  });

  it("does not count duplicate evidence from the same source as independent", () => {
    const result = corroborate({
      statement: "He ate at Example Grill.",
      evidence: [evidence("e1", "receipt-1", 0.9), evidence("e2", "receipt-1", 0.9)],
    });

    expect(result.independentSourceCount).toBe(1);
    expect(result.knowledgeState).toBe("reconstructed");
  });

  it("reports unknown when evidence is absent", () => {
    const result = corroborate({ statement: "He ordered pizza.", evidence: [] });
    expect(result.knowledgeState).toBe("unknown");
    expect(result.gaps).toContain("No supporting evidence was found.");
  });
});
