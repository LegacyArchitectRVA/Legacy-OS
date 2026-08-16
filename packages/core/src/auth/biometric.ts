export type BiometricPlatform =
  | "ios-face-id"
  | "ios-touch-id"
  | "android-biometric"
  | "windows-hello"
  | "macos-touch-id"
  | "platform-webauthn"
  | "other";

export type BiometricModality = "face" | "fingerprint" | "device-biometric";

export interface BiometricAssertion {
  credentialId: string;
  personId: string;
  platform: BiometricPlatform;
  modality: BiometricModality;
  verified: boolean;
  userPresent: boolean;
  userVerified: boolean;
  challengeId: string;
  providerId: string;
  providerVersion: string;
  assertedAt: string;
}

export interface BiometricProvider {
  readonly id: string;
  readonly version: string;
  verifyAssertion(input: {
    personId: string;
    challengeId: string;
    credential: unknown;
  }): Promise<BiometricAssertion>;
}

/**
 * Prefer platform/WebAuthn biometrics. The server stores a public credential
 * identifier and verification metadata, never a fingerprint or face template.
 */
export function isUsableBiometricAssertion(
  assertion: BiometricAssertion,
  expectedPersonId: string,
  expectedChallengeId: string,
): boolean {
  return (
    assertion.verified &&
    assertion.userPresent &&
    assertion.userVerified &&
    assertion.personId === expectedPersonId &&
    assertion.challengeId === expectedChallengeId &&
    Boolean(assertion.credentialId) &&
    Boolean(assertion.providerId) &&
    Boolean(assertion.providerVersion)
  );
}

/** Biometrics can authenticate a session, but do not independently authorize regulated actions. */
export function biometricAssurance(assertion: BiometricAssertion): "standard" | "strong" {
  return assertion.verified && assertion.userPresent && assertion.userVerified ? "strong" : "standard";
}

export function canUseBiometricForHighRiskAction(assertion: BiometricAssertion): boolean {
  // High-risk operations require the application's step-up policy in addition
  // to biometric verification. This prevents a biometric assertion from being
  // treated as blanket authorization for financial, health, legal, or consent changes.
  return false;
}
