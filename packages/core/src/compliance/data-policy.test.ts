import { describe, expect, it } from "vitest";
import { evaluateCompliance } from "./data-policy.js";

describe("compliance data policy", () => {
  it("requires authorization, consent, purpose, jurisdiction and minimum necessary handling for high-risk data", () => {
    const result = evaluateCompliance({
      jurisdiction: "US-VA",
      purpose: "memory reconstruction",
      classifications: ["health", "financial", "precise-location"],
      authorizationActive: false,
      consentActive: false,
      minimumNecessary: false,
    });

    expect(result.allowed).toBe(false);
    expect(result.reasons).toEqual(expect.arrayContaining([
      "authorization-required",
      "active-consent-required",
      "minimum-necessary-failed",
    ]));
  });

  it("allows low-risk data when the mandatory context is present", () => {
    const result = evaluateCompliance({
      jurisdiction: "US-VA",
      purpose: "public memory",
      classifications: ["public"],
      authorizationActive: false,
      consentActive: false,
      minimumNecessary: true,
    });

    expect(result.allowed).toBe(true);
  });
});
