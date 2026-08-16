import { describe, expect, it } from "vitest";
import { canConnectSource, canUseConnectedSource, evaluateConsent, type EchoConsentGrant } from "./consent.js";

const base: EchoConsentGrant = { id: "consent-1", subjectPersonId: "dad", scope: "financial-accounts", status: "granted", visibility: "family", grantedAt: "2026-01-01T00:00:00Z", source: "subject", policyVersion: "1.0", connectedSourceIds: ["bank:1"] };
const signature = { id: "sig", method: "electronic" as const, signerPersonId: "dad", signedAt: "2026-01-01T00:01:00Z", artifactHash: "sha256:abc" };

describe("Echo consent policy", () => {
  it("requires a signature for financial account access", () => expect(evaluateConsent([base], "dad", "financial-accounts", "family").reason).toBe("signature-required"));
  it("accepts a valid electronic signature", () => expect(canConnectSource([{ ...base, signature }], "dad", "financial-accounts", "family")).toBe(true));
  it("requires physical signature uploads to retain an artifact", () => {
    const grant = { ...base, signature: { ...signature, method: "physical-upload" as const, artifactHash: undefined } };
    expect(evaluateConsent([grant], "dad", "financial-accounts", "family").reason).toBe("invalid-signature");
  });
  it("rejects a signature from the wrong signer", () => {
    const grant = { ...base, signature: { ...signature, signerPersonId: "stranger" } };
    expect(evaluateConsent([grant], "dad", "financial-accounts", "family").reason).toBe("invalid-signature");
  });
  it("rejects a signature dated before the grant", () => {
    const grant = { ...base, signature: { ...signature, signedAt: "2025-12-31T23:59:00Z" } };
    expect(evaluateConsent([grant], "dad", "financial-accounts", "family").reason).toBe("invalid-signature");
  });
  it("blocks revoked or expired consent", () => {
    expect(evaluateConsent([{ ...base, status: "revoked", signature }], "dad", "financial-accounts", "family").allowed).toBe(false);
    expect(evaluateConsent([{ ...base, expiresAt: "2025-01-01T00:00:00Z", signature }], "dad", "financial-accounts", "family", new Date("2026-02-01T00:00:00Z")).reason).toBe("expired");
  });
  it("only permits sources explicitly connected to the grant", () => {
    const grant = { ...base, signature };
    expect(canUseConnectedSource([grant], "dad", "financial-accounts", "bank:1", "family")).toBe(true);
    expect(canUseConnectedSource([grant], "dad", "financial-accounts", "bank:2", "family")).toBe(false);
  });
});
