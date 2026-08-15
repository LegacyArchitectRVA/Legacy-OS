import { describe, expect, it } from "vitest";
import { isConsentActive, requireActiveConsent } from "./authorization.js";

describe("active consent", () => {
  const base = { granted: true, grantedAt: "2026-08-01T00:00:00Z" };

  it("accepts an active non-expiring grant", () => {
    expect(isConsentActive(base, "2026-08-08T00:00:00Z")).toBe(true);
  });

  it("rejects an expired grant", () => {
    expect(isConsentActive({ ...base, expiresAt: "2026-08-07T00:00:00Z" }, "2026-08-08T00:00:00Z")).toBe(false);
  });

  it("rejects a revoked grant", () => {
    expect(isConsentActive({ ...base, revokedAt: "2026-08-06T00:00:00Z" }, "2026-08-08T00:00:00Z")).toBe(false);
  });

  it("throws for inactive consent", () => {
    expect(() => requireActiveConsent({ ...base, expiresAt: "2026-08-07T00:00:00Z" }, "avatar", "2026-08-08T00:00:00Z")).toThrow("Active consent is required for avatar");
  });
});
