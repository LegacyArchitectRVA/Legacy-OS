import {
  isSessionActive,
  requireActiveSession,
  type AuthSession,
  type AuthenticationAssurance,
  type AuthenticationMethod,
  type StandardAuthMethod,
  type StandardAuthProvider,
  type VoiceAuthProvider,
  type VoiceVerificationRequest,
} from "./authentication.js";
import { validateBiometricAssertion, type BiometricAssertion, type BiometricOperation } from "./biometric-policy.js";

export interface AuthenticatedIdentity { personId: string; method: AuthenticationMethod; assurance: AuthenticationAssurance; providerUserId?: string; }
export interface BiometricLoginRequest { personId: string; challengeId: string; assertion: BiometricAssertion; }
export interface VoiceLoginRequest extends VoiceVerificationRequest {}

export function authenticateWithStandardProvider(provider: StandardAuthProvider, method: StandardAuthMethod, credential: unknown): Promise<{ providerUserId: string; method: StandardAuthMethod }> {
  return provider.signIn(method, credential).then(({ providerUserId }) => ({ providerUserId, method }));
}

export function authenticateWithBiometric(request: BiometricLoginRequest): AuthenticatedIdentity {
  const result = validateBiometricAssertion(request.assertion, request.personId, request.challengeId, "login");
  if (!result.allowed) throw new Error(`Biometric authentication rejected: ${result.reason}`);
  return { personId: request.personId, method: "passkey", assurance: request.assertion.assurance === "strong" ? "strong" : "standard" };
}

export async function authenticateWithVoice(provider: VoiceAuthProvider, request: VoiceLoginRequest): Promise<AuthenticatedIdentity> {
  const result = await provider.verify(request);
  if (!result.verified || !result.livenessPassed || !result.antiSpoofPassed || result.confidence < 0.9) throw new Error("Voice authentication rejected");
  return { personId: request.personId, method: "voice", assurance: "standard" };
}

export function authorizeAuthenticatedOperation(session: AuthSession, operation: BiometricOperation, biometric?: BiometricAssertion, now = new Date()): void {
  requireActiveSession(session, now);
  if (operation !== "login" && session.personId !== biometric?.personId) throw new Error("Authentication identity mismatch");
  if (operation === "login") return;
  if (!biometric) throw new Error("Step-up biometric verification required");
  const result = validateBiometricAssertion(biometric, session.personId, biometric.challengeId, operation);
  if (!result.allowed) throw new Error(`Biometric step-up rejected: ${result.reason}`);
}

export function sessionCanPerformOperation(session: AuthSession, operation: BiometricOperation, now = new Date()): boolean {
  if (!isSessionActive(session, now)) return false;
  if (operation === "login") return true;
  return session.assurance === "strong" || session.assurance === "step-up";
}
