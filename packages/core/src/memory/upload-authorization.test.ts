import { describe, expect, it } from "vitest";
import { authorizeUploadedSource } from "./upload-authorization.js";
import type { EchoConsentRecord } from "./consent-vault.js";

const signedFinancialConsent: EchoConsentRecord = {
  id: "consent-1",
  subjectPersonId: "person-1",
  scope: "financial-statements",
  status: "granted",
  visibility: "successor",
  source: "subject",
  policyVersion: "1.0",
  signature: {
    method: "electronic",
    artifactSourceId: "signature-1",
    contentHash: "sig-hash",
    signedAt: "2026-08-14T12:00:00.000Z",
    signerPersonId: "person-1",
  },
  connectionIds: [],
};

describe("uploaded source authorization", () => {
  it("asks for confirmation when the uploaded category is not authorized", () => {
    const result = authorizeUploadedSource([], {
      sourceId: "upload-1",
      subjectPersonId: "person-1",
      kind: "financial-statement",
      proposedScope: "financial-statements",
      visibility: "successor",
      contentHash: "doc-hash",
    });

    expect(result.allowed).toBe(false);
    expect(result.needsConfirmation).toBe(true);
    expect(result.reason).toBe("missing");
  });

  it("allows a signed authorized upload", () => {
    const result = authorizeUploadedSource([signedFinancialConsent], {
      sourceId: "upload-1",
      subjectPersonId: "person-1",
      kind: "financial-statement",
      proposedScope: "financial-statements",
      visibility: "successor",
      contentHash: "doc-hash",
    });

    expect(result.allowed).toBe(true);
    expect(result.needsConfirmation).toBe(false);
    expect(result.reason).toBe("authorized");
  });
});
