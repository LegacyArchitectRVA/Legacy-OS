import { describe, expect, it } from "vitest";
import { CONTINUITY_PILLARS } from "./continuity-pillar-store";
import { buildContinuityPillarCoverage } from "./continuity";

describe("continuity pillar model", () => {
  it("contains exactly seven pillars in the product order", () => {
    expect(CONTINUITY_PILLARS.map(([key]) => key)).toEqual([
      "digital_life",
      "financial_assets",
      "household_property",
      "health_medical",
      "vital_records",
      "business_continuity",
      "legacy_wishes",
    ]);
  });

  it("maps continuity evidence into all seven pillars", () => {
    const coverage = buildContinuityPillarCoverage([
      { context: "digital", title: "Email and devices", narrative: "Primary email, phone and computer access", provenanceComplete: true },
      { context: "financial", title: "Bank and retirement", narrative: "Bank, investment and retirement accounts", provenanceComplete: true },
      { context: "property", title: "Home", narrative: "Home, vehicle and utility instructions", provenanceComplete: true },
      { context: "health", title: "Medical", narrative: "Doctor, medications and care instructions", provenanceComplete: true },
      { context: "records", title: "Vital records", narrative: "Birth, marriage and identity records", provenanceComplete: true },
      { context: "business", title: "Operations", narrative: "Business clients, vendors and succession", provenanceComplete: true },
      { context: "legacy", title: "Wishes", narrative: "Funeral, memorial and personal wishes", provenanceComplete: true },
    ]);

    expect(coverage).toHaveLength(7);
    expect(coverage.every((pillar) => pillar.matchedMemories > 0)).toBe(true);
    expect(coverage.every((pillar) => pillar.coverageScore >= 55)).toBe(true);
  });
});
