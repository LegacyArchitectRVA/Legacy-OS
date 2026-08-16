import { describe, expect, it } from "vitest";
import { evaluateRuntimeCompliance } from "./runtime-gate.js";

describe("runtime compliance gate", () => {
  const valid = {
    dataClasses: ["health" as const],
    jurisdiction: "US-VA",
    authorized: true,
    consentActive: true,
    purpose: "authorized memory retrieval",
    minimumNecessary: true,
    auditEnabled: true,
    retentionPolicyId: "hipaa-default",
    vendorReviewComplete: true,
    legalReviewComplete: true,
  };

  it("allows a fully controlled sensitive-data operation", () => {
    expect(evaluateRuntimeCompliance(valid).allowed).toBe(true);
  });

  it("blocks sensitive data without active consent", () => {
    const result = evaluateRuntimeCompliance({ ...valid, consentActive: false });
    expect(result.allowed).toBe(false);
    expect(result.reasons).toContain("active-consent-required");
  });

  it("blocks sensitive data without minimum-necessary approval", () => {
    const result = evaluateRuntimeCompliance({ ...valid, minimumNecessary: false });
    expect(result.reasons).toContain("minimum-necessary-failure");
  });

  it("blocks sensitive data without audit or retention controls", () => {
    const result = evaluateRuntimeCompliance({ ...valid, auditEnabled: false, retentionPolicyId: undefined });
    expect(result.reasons).toEqual(expect.arrayContaining(["audit-required", "retention-policy-required"]));
  });

  it("allows public data without consent", () => {
    const result = evaluateRuntimeCompliance({
      ...valid,
      dataClasses: ["public"],
      authorized: false,
      consentActive: false,
      minimumNecessary: false,
      auditEnabled: false,
      retentionPolicyId: undefined,
    });
    expect(result.allowed).toBe(true);
  });
});
