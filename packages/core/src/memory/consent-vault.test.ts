import { describe, expect, it } from "vitest";
import { canUseConnectedSource, evaluateConsent, type EchoConsentRecord } from "./consent-vault.js";

const base: EchoConsentRecord = {
  id: "consent-1",
  subjectPersonId: "dad",
  scope: "financial-accounts",
  status: "granted",
  visibility: "successor",
  grantedAt: "2026-01-01T00:00:00Z",
  source: "subject",
  policyVersion: "1.0",
  connectionIds: ["bank-1"],
  signature: {
    method: "electronic",
    artifactSourceId: "signature-1",
    contentHash: "sha256:abc",
    signedAt: "2026-01-01T00:00:00Z",
    signerPersonId: "dad",
  },
};

describe("Echo consent vault", () => {
  it("permits a selected financial connection only with granted consent", () => {
    expect(canUseConnectedSource([base], "dad", "financial-accounts", "successor")).toBe(true);
  });

  it("rejects revoked consent", () => {
    expect(evaluateConsent([{ ...base, status: "revoked", revokedAt: "2026-02-01T00:00:00Z" }], "dad", "financial-accounts", "successor")).toEqual({
      allowed: false,
      reason: "revoked",
    });
  });

  it("rejects expired consent", () => {
    expect(evaluateConsent([{ ...base, expiresAt: "2025-01-01T00:00:00Z" }], "dad", "financial-accounts", "successor", new Date("2026-01-01T00:00:00Z"))).toEqual({
      allowed: false,
      reason: "expired",
    });
  });

  it("supports physical signature uploads as consent evidence", () => {
    const record = { ...base, signature: { ...base.signature!, method: "physical-upload" as const } };
    expect(record.signature.method).toBe("physical-upload");
    expect(record.signature.artifactSourceId).toBe("signature-1");
  });
});
