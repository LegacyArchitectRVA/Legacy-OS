import { describe, expect, it } from "vitest";
import { canConnectSource, evaluateConsent, type EchoConsentGrant } from "./consent.js";

const base: EchoConsentGrant = {
  id: "consent-1",
  subjectPersonId: "dad",
  scope: "financial-accounts",
  status: "granted",
  visibility: "family",
  grantedAt: "2026-01-01T00:00:00Z",
  source: "subject",
  policyVersion: "1.0",
  connectedSourceIds: [],
};

describe("Echo consent policy", () => {
  it("requires a signature for financial account access", () => {
    expect(evaluateConsent([base], "dad", "financial-accounts", "family").reason).toBe("signature-required");
    expect(canConnectSource([base], "dad", "financial-accounts", "family")).toBe(false);
  });

  it("accepts electronic signature evidence", () => {
    const grant = {
      ...base,
      signature: {
        id: "sig-1",
        method: "electronic" as const,
        signerPersonId: "dad",
        signedAt: "2026-01-01T00:01:00Z",
        artifactHash: "sha256:abc",
      },
    };
    expect(canConnectSource([grant], "dad", "financial-accounts", "family")).toBe(true);
  });

  it("accepts a physical signature upload as evidence", () => {
    const grant = {
      ...base,
      signature: {
        id: "sig-2",
        method: "physical-upload" as const,
        signerPersonId: "dad",
        signedAt: "2026-01-01T00:01:00Z",
        artifactSourceId: "document:signature",
        artifactHash: "sha256:def",
      },
    };
    expect(canConnectSource([grant], "dad", "financial-accounts", "family")).toBe(true);
  });

  it("blocks revoked or expired consent", () => {
    expect(evaluateConsent([{ ...base, status: "revoked" }], "dad", "financial-accounts", "family").allowed).toBe(false);
    expect(evaluateConsent([{ ...base, expiresAt: "2025-01-01T00:00:00Z", signature: { id: "s", method: "electronic", signerPersonId: "dad", signedAt: "2026-01-01T00:00:00Z" } }], "dad", "financial-accounts", "family", new Date("2026-02-01T00:00:00Z")).reason).toBe("expired");
  });
});
