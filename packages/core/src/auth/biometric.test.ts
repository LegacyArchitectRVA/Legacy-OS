import { describe, expect, it } from "vitest";
import { biometricAssurance, canUseBiometricForHighRiskAction, isUsableBiometricAssertion } from "./biometric.js";

const assertion = {
  credentialId: "webauthn-credential-1",
  personId: "person-1",
  platform: "ios-face-id" as const,
  modality: "face" as const,
  verified: true,
  userPresent: true,
  userVerified: true,
  challengeId: "challenge-1",
  providerId: "webauthn-platform",
  providerVersion: "1.0.0",
  assertedAt: "2026-08-16T00:00:00Z",
};

describe("privacy-preserving biometric authentication", () => {
  it("accepts a verified platform biometric assertion for the expected challenge and person", () => {
    expect(isUsableBiometricAssertion(assertion, "person-1", "challenge-1")).toBe(true);
    expect(biometricAssurance(assertion)).toBe("strong");
  });

  it("rejects assertions for another person or challenge", () => {
    expect(isUsableBiometricAssertion(assertion, "person-2", "challenge-1")).toBe(false);
    expect(isUsableBiometricAssertion(assertion, "person-1", "challenge-2")).toBe(false);
  });

  it("requires user verification and presence", () => {
    expect(isUsableBiometricAssertion({ ...assertion, userVerified: false }, "person-1", "challenge-1")).toBe(false);
    expect(isUsableBiometricAssertion({ ...assertion, userPresent: false }, "person-1", "challenge-1")).toBe(false);
  });

  it("never treats biometrics alone as authorization for high-risk operations", () => {
    expect(canUseBiometricForHighRiskAction(assertion)).toBe(false);
  });

  it("does not require raw face or fingerprint templates in the assertion", () => {
    expect(assertion).not.toHaveProperty("faceTemplate");
    expect(assertion).not.toHaveProperty("fingerprintTemplate");
  });
});
