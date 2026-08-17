import { describe, expect, it } from "vitest";
import { authorizeExperiencePlan, createExperiencePlan, evaluateExperiencePlanAuthorization } from "./reconstruction.js";

describe("consent-gated reconstruction", () => {
  const plan = createExperiencePlan("dad", "child", "memory:fishing", ["photo:fishing"]);
  const activeConsent = {
    enabled: true,
    scope: ["scene"] as const,
    grantedBy: "dad",
    grantedAt: "2026-08-11T00:00:00Z",
  };

  it("requires explicit reconstruction consent", () => {
    expect(evaluateExperiencePlanAuthorization(plan, { ...activeConsent, enabled: false }, new Date("2026-08-11T01:00:00Z")))
      .toEqual({ allowed: false, reason: "consent-missing" });
  });

  it("requires consent for every requested reconstruction kind", () => {
    expect(evaluateExperiencePlanAuthorization(plan, { ...activeConsent, scope: ["voice"] }, new Date("2026-08-11T01:00:00Z")))
      .toEqual({ allowed: false, reason: "scope-restricted" });
  });

  it("allows an evidence-backed, explicitly authorized experience", () => {
    expect(evaluateExperiencePlanAuthorization(plan, activeConsent, new Date("2026-08-11T01:00:00Z")))
      .toEqual({ allowed: true, reason: "authorized" });
    expect(authorizeExperiencePlan(plan, activeConsent, new Date("2026-08-11T01:00:00Z"))).toBe(plan);
  });

  it("denies expired reconstruction without denying the underlying information", () => {
    expect(evaluateExperiencePlanAuthorization(plan, {
      ...activeConsent,
      expiresAt: "2026-08-11T00:30:00Z",
    }, new Date("2026-08-11T01:00:00Z"))).toEqual({ allowed: false, reason: "consent-expired" });
  });

  it("denies reconstruction when evidence is missing", () => {
    const noEvidencePlan = { ...plan, segments: [{ ...plan.segments[0], sourceIds: [] }] };
    expect(evaluateExperiencePlanAuthorization(noEvidencePlan, activeConsent, new Date("2026-08-11T01:00:00Z")))
      .toEqual({ allowed: false, reason: "evidence-missing" });
  });
});
