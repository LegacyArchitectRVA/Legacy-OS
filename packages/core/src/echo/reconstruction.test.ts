import { describe, expect, it } from "vitest";
import { authorizeExperiencePlan, createExperiencePlan } from "./reconstruction.js";

describe("consent-gated reconstruction", () => {
  const plan = createExperiencePlan("dad", "child", "memory:fishing", ["photo:fishing"]);

  it("requires explicit reconstruction consent", () => {
    expect(() => authorizeExperiencePlan(plan, {
      enabled: false,
      scope: ["scene"],
      grantedBy: "child",
      grantedAt: "2026-08-11T00:00:00Z",
    })).toThrow("consent is not enabled");
  });

  it("requires consent for every requested reconstruction kind", () => {
    expect(() => authorizeExperiencePlan(plan, {
      enabled: true,
      scope: ["voice"],
      grantedBy: "child",
      grantedAt: "2026-08-11T00:00:00Z",
    })).toThrow("does not cover scene");
  });

  it("allows an evidence-backed, explicitly authorized experience", () => {
    expect(authorizeExperiencePlan(plan, {
      enabled: true,
      scope: ["scene"],
      grantedBy: "child",
      grantedAt: "2026-08-11T00:00:00Z",
    })).toBe(plan);
  });
});
