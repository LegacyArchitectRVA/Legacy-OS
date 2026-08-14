import { describe, expect, it } from "vitest";
import { ingestProtectedSource } from "./protected-source.js";
import type { EchoConsentRecord } from "./consent-vault.js";

const baseGrant: EchoConsentRecord = {
  id: "consent-1",
  subjectPersonId: "person-1",
  scope: "financial-accounts",
  status: "granted",
  visibility: "successor",
  source: "subject",
  policyVersion: "1.0",
  signature: {
    method: "electronic",
    artifactSourceId: "signature-1",
    contentHash: "hash",
    signedAt: "2026-08-14T00:00:00.000Z",
    signerPersonId: "person-1",
  },
  connectionIds: [],
};

describe("protected source ingestion", () => {
  it("accepts a signed authorized source", () => {
    const result = ingestProtectedSource([baseGrant], {
      sourceId: "bank-1",
      subjectPersonId: "person-1",
      scope: "financial-accounts",
      visibility: "successor",
      payload: { provider: "example" },
    });

    expect(result.accepted).toBe(true);
    expect(result.decision.reason).toBe("authorized");
  });

  it("rejects a source without consent", () => {
    const result = ingestProtectedSource([], {
      sourceId: "bank-1",
      subjectPersonId: "person-1",
      scope: "financial-accounts",
      visibility: "successor",
      payload: {},
    });

    expect(result.accepted).toBe(false);
    expect(result.decision.reason).toBe("missing");
  });

  it("rejects revoked consent", () => {
    const result = ingestProtectedSource([
      { ...baseGrant, status: "revoked", revokedAt: "2026-08-14T01:00:00.000Z" },
    ], {
      sourceId: "bank-1",
      subjectPersonId: "person-1",
      scope: "financial-accounts",
      visibility: "successor",
      payload: {},
    });

    expect(result.accepted).toBe(false);
    expect(result.decision.reason).toBe("revoked");
  });
});
