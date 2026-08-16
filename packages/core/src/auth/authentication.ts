export type StandardAuthMethod =
  | "password"
  | "magic-link"
  | "oauth"
  | "passkey";

export type AuthenticationMethod = StandardAuthMethod | "voice";

export type AuthenticationAssurance = "standard" | "strong" | "step-up";

export interface AuthSession {
  id: string;
  personId: string;
  method: AuthenticationMethod;
  assurance: AuthenticationAssurance;
  issuedAt: string;
  expiresAt: string;
  revokedAt?: string;
}

export interface StandardAuthProvider {
  readonly id: string;
  readonly methods: readonly StandardAuthMethod[];
  signIn(method: StandardAuthMethod, credential: unknown): Promise<{ providerUserId: string }>;
  signOut(sessionId: string): Promise<void>;
}

export interface VoiceVerificationRequest {
  personId: string;
  challengeId: string;
  audio: Blob | ArrayBuffer;
  locale?: string;
}

export interface VoiceVerificationResult {
  verified: boolean;
  confidence: number;
  livenessPassed: boolean;
  antiSpoofPassed: boolean;
  providerId: string;
  providerVersion: string;
}

/**
 * Voice authentication is a biometric factor, not a password substitute.
 * Providers must perform liveness and anti-spoof checks, and the core layer
 * deliberately stores verification metadata rather than raw enrollment audio.
 */
export interface VoiceAuthProvider {
  readonly id: string;
  readonly version: string;
  verify(request: VoiceVerificationRequest): Promise<VoiceVerificationResult>;
}

export function isUsableVoiceVerification(result: VoiceVerificationResult): boolean {
  return result.verified && result.livenessPassed && result.antiSpoofPassed && result.confidence >= 0.9;
}

export function canUseVoiceForHighRiskAction(result: VoiceVerificationResult): boolean {
  // Voice alone must never unlock sensitive financial, health, legal, or consent actions.
  return false;
}

export function isSessionActive(session: AuthSession, now = new Date()): boolean {
  if (session.revokedAt) return false;
  const nowMs = now.getTime();
  const expiresMs = Date.parse(session.expiresAt);
  return Number.isFinite(expiresMs) && nowMs < expiresMs;
}

export function requireActiveSession(session: AuthSession, now = new Date()): void {
  if (!isSessionActive(session, now)) throw new Error("Authentication session is inactive");
}
