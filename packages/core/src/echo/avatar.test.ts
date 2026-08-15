import { describe, expect, it } from "vitest";
import { createAvatarPlan } from "./avatar.js";

describe("avatar reconstruction consent", () => {
  const base = {
    subjectPersonId: "person-1",
    sourceIds: ["photo-1"],
    modelProvider: "provider",
    modelVersion: "1",
    consentRequired: true as const,
  };

  it("rejects reconstruction without explicit consent", () => {
    expect(() => createAvatarPlan({ ...base, consentGranted: false })).toThrow(
      "explicit consent",
    );
  });

  it("requires source evidence even when consent exists", () => {
    expect(() =>
      createAvatarPlan({ ...base, sourceIds: [], consentGranted: true }),
    ).toThrow("source evidence");
  });

  it("allows a consented evidence-backed reconstruction", () => {
    expect(
      createAvatarPlan({ ...base, consentGranted: true }).reference.consentGranted,
    ).toBe(true);
  });
});
