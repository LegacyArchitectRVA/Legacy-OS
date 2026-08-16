import { describe, expect, it } from "vitest";
import { validateBiometricAssertion, type BiometricAssertion } from "./biometric-policy.js";

const assertion: BiometricAssertion = {
  personId: "person-1",
  credentialId: "credential-1",
  challengeId: "challenge-1",
  modality: "face",
  assurance: "device_verified",
  userVerified: true,
  userPresent: true,
  provider: "platform",
  providerVersion: "1",
  verifiedAt: "2026-08-16T12:00:00Z",
};

describe("biometric policy", () => {
  it("allows ordinary login with a verified platform biometric", () => {
    expect(validateBiometricAssertion(assertion, "person-1", "challenge-1", "login").allowed).toBe(true);
  });

  it("rejects an assertion for another person", () => {
    expect(validateBiometricAssertion(assertion, "person-2", "challenge-1", "login").reason).toBe("person-mismatch");
  });

  it("rejects replayed or unrelated challenges", () => {
    expect(validateBiometricAssertion(assertion, "person-1", "different", "login").reason).toBe("challenge-mismatch");
  });

  it("requires user presence and verification", () => {
    expect(validateBiometricAssertion({ ...assertion, userVerified: false }, "person-1", "challenge-1", "login").reason).toBe("user-not-verified");
  });

  it("requires strong assurance for high-risk operations", () => {
    expect(validateBiometricAssertion(assertion, "person-1", "challenge-1", "financial_connection").reason).toBe("step-up-required");
  });

  it("allows strong biometric assurance for high-risk operations", () => {
    expect(validateBiometricAssertion({ ...assertion, assurance: "strong" }, "person-1", "challenge-1", "financial_connection").allowed).toBe(true);
  });
});
