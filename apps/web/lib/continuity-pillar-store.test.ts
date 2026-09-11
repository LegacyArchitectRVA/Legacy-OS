import { describe, expect, it } from "vitest";
import { CONTINUITY_PILLARS } from "./continuity-pillar-store";

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
});
