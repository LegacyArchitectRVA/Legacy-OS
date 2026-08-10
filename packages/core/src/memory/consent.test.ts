import { describe, expect, it } from "vitest";
import { evaluateConsent, type EchoConsentGrant } from "./consent.js";

const baseGrant: EchoConsentGrant = {
  id: "consent:dad:voice",
  subjectPersonId: "dad",
  scope: "voice",
  status: "granted",
  visibility: "family",
  grantedAt: "2026-08-09T00:00:00Z",
  source: "subject",
  policyVersion: "1.0",
};

describe("Echo consent", () => {
  it("grants an active consent within its visibility boundary", () => {
    expect(evaluateConsent([baseGrant], "dad", "voice", "family")).toEqual({
      allowed: true,
      reason: "granted",
    });
  });

  it("blocks missing consent", () => {
    expect(evaluateConsent([], "dad", "voice", "family").reason).toBe("missing");
  });

  it("blocks revoked consent", () => {
    expect(
      evaluateConsent([{ ...baseGrant, status: "revoked" }], "dad", "voice", "family").reason,
    ).toBe("revoked");
  });

  it("blocks expired consent", () => {
    expect(
      evaluateConsent(
        [{ ...baseGrant, expiresAt: "2026-01-01T00:00:00Z" }],
        "dad",
        "voice",
        "family",
        new Date("2026-08-10T00:00:00Z"),
      ).reason,
    ).toBe("expired");
  });

  it("blocks a request above the granted visibility", () => {
    expect(evaluateConsent([baseGrant], "dad", "voice", "successor").reason).toBe(
      "visibility-restricted",
    );
  });
});
