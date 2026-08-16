import { describe, expect, it } from "vitest";
import { authenticateWithBiometric, authenticateWithVoice, authorizeAuthenticatedOperation } from "./auth-boundary.js";
import type { AuthSession, StandardAuthProvider, VoiceAuthProvider } from "./authentication.js";
import type { BiometricAssertion } from "./biometric-policy.js";

const session: AuthSession = {
  id: "session-1",
  personId: "person-1",
  method: "passkey",
  assurance: "strong",
  issuedAt: "2026-08-16T10:00:00Z",
  expiresAt: "2026-08-17T10:00:00Z",
};

const biometric: BiometricAssertion = {
  personId: "person-1",
  credentialId: "credential-1",
  challengeId: "challenge-1",
  modality: "face",
  assurance: "strong",
  userVerified: true,
  userPresent: true,
  provider: "platform",
  providerVersion: "1",
  verifiedAt: "2026-08-16T10:01:00Z",
};

describe("authentication integration boundary", () => {
  it("supports standard provider authentication", async () => {
    const provider: StandardAuthProvider = {
      id: "test",
      methods: ["password", "magic-link", "oauth", "passkey"],
      async signIn(method) { return { providerUserId: `user-${method}` }; },
      async signOut() {},
    };
    const result = await provider.signIn("password", "credential");
    expect(result.providerUserId).toBe("user-password");
  });

  it("turns a valid biometric assertion into an authenticated identity", () => {
    expect(authenticateWithBiometric({ personId: "person-1", challengeId: "challenge-1", assertion: biometric })).toMatchObject({ personId: "person-1", assurance: "strong" });
  });

  it("requires biometric step-up for high-risk operations", () => {
    expect(() => authorizeAuthenticatedOperation(session, "financial_connection", undefined, new Date("2026-08-16T11:00:00Z"))).toThrow("Step-up biometric verification required");
    expect(() => authorizeAuthenticatedOperation(session, "financial_connection", { ...biometric, assurance: "device_verified" }, new Date("2026-08-16T11:00:00Z"))).toThrow("step-up-required");
    expect(() => authorizeAuthenticatedOperation(session, "financial_connection", biometric, new Date("2026-08-16T11:00:00Z"))).not.toThrow();
  });

  it("never allows biometric identity substitution", () => {
    expect(() => authorizeAuthenticatedOperation(session, "health_data", { ...biometric, personId: "person-2" }, new Date("2026-08-16T11:00:00Z"))).toThrow("Authentication identity mismatch");
  });

  it("requires live anti-spoofed voice verification for voice login", async () => {
    const provider: VoiceAuthProvider = {
      id: "voice-test",
      version: "1",
      async verify() { return { verified: true, confidence: 0.96, livenessPassed: true, antiSpoofPassed: true, providerId: "voice-test", providerVersion: "1" }; },
    };
    await expect(authenticateWithVoice(provider, { personId: "person-1", challengeId: "voice-challenge", audio: new ArrayBuffer(0) })).resolves.toMatchObject({ personId: "person-1", method: "voice", assurance: "standard" });
  });
});
