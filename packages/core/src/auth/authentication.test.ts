import { describe, expect, it } from "vitest";
import {
  canUseVoiceForHighRiskAction,
  isSessionActive,
  isUsableVoiceVerification,
  requireActiveSession,
} from "./authentication.js";

describe("authentication boundary", () => {
  const voice = {
    verified: true,
    confidence: 0.96,
    livenessPassed: true,
    antiSpoofPassed: true,
    providerId: "voice-provider",
    providerVersion: "1.0.0",
  };

  it("accepts a verified, live, anti-spoofed voice factor", () => {
    expect(isUsableVoiceVerification(voice)).toBe(true);
  });

  it("rejects voice verification without liveness or anti-spoofing", () => {
    expect(isUsableVoiceVerification({ ...voice, livenessPassed: false })).toBe(false);
    expect(isUsableVoiceVerification({ ...voice, antiSpoofPassed: false })).toBe(false);
  });

  it("never treats voice alone as sufficient for high-risk actions", () => {
    expect(canUseVoiceForHighRiskAction(voice)).toBe(false);
  });

  it("recognizes expired and revoked sessions", () => {
    const active = {
      id: "session-1",
      personId: "person-1",
      method: "passkey" as const,
      assurance: "strong" as const,
      issuedAt: "2026-08-16T00:00:00Z",
      expiresAt: "2026-08-17T00:00:00Z",
    };
    expect(isSessionActive(active, new Date("2026-08-16T12:00:00Z"))).toBe(true);
    expect(isSessionActive({ ...active, revokedAt: "2026-08-16T13:00:00Z" }, new Date("2026-08-16T14:00:00Z"))).toBe(false);
    expect(isSessionActive({ ...active, expiresAt: "2026-08-16T11:00:00Z" }, new Date("2026-08-16T12:00:00Z"))).toBe(false);
  });

  it("requires an active session", () => {
    const expired = {
      id: "session-1",
      personId: "person-1",
      method: "magic-link" as const,
      assurance: "standard" as const,
      issuedAt: "2026-08-15T00:00:00Z",
      expiresAt: "2026-08-16T00:00:00Z",
    };
    expect(() => requireActiveSession(expired, new Date("2026-08-16T01:00:00Z"))).toThrow("Authentication session is inactive");
  });
});
