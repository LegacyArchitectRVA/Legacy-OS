import { describe, expect, it } from "vitest";
import { CONTINUITY_PILLARS } from "./continuity-pillar-store";
import { buildContinuityPillarCoverage } from "./continuity";

describe("continuity pillar model", () => {
  it("contains exactly seven pillars in the Life Manual order", () => {
    expect(CONTINUITY_PILLARS.map(([key]) => key)).toEqual([
      "digital_life",
      "emergency_successor_access",
      "financial_assets",
      "household_operations",
      "vital_records",
      "legacy_wishes",
      "business_continuity",
    ]);
  });

  it("maps continuity evidence into all seven pillars", () => {
    const coverage = buildContinuityPillarCoverage([
      { context: "digital", title: "Email and devices", narrative: "Primary email, phone and computer access", provenanceComplete: true },
      { context: "emergency", title: "Successor access", narrative: "Executor contact, power of attorney and successor authority instructions", provenanceComplete: true },
      { context: "financial", title: "Bank and retirement", narrative: "Bank, investment and retirement accounts", provenanceComplete: true },
      { context: "household", title: "Home operations", narrative: "Home, vehicle and utility maintenance routine", provenanceComplete: true },
      { context: "records", title: "Vital records", narrative: "Birth, marriage and identity records", provenanceComplete: true },
      { context: "legacy", title: "Wishes", narrative: "Funeral, memorial and personal wishes", provenanceComplete: true },
      { context: "business", title: "Operations", narrative: "Business clients, vendors and succession", provenanceComplete: true },
    ]);

    expect(coverage).toHaveLength(7);
    expect(coverage.every((pillar) => pillar.matchedMemories > 0)).toBe(true);
    expect(coverage.every((pillar) => pillar.coverageScore >= 55)).toBe(true);
  });
});
