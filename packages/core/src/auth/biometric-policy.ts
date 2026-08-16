export type BiometricModality = "face" | "fingerprint" | "platform" | "other";

export type BiometricAssurance = "device_verified" | "strong";

export interface BiometricAssertion {
  personId: string;
  credentialId: string;
  challengeId: string;
  modality: BiometricModality;
  assurance: BiometricAssurance;
  userVerified: boolean;
  userPresent: boolean;
  provider: string;
  providerVersion: string;
  verifiedAt: string;
}

export type BiometricOperation =
  | "login"
  | "view_sensitive_memory"
  | "financial_connection"
  | "health_data"
  | "change_consent"
  | "sign_authorization"
  | "delete_legacy"
  | "voice_reconstruction"
  | "avatar_reconstruction";

const HIGH_RISK = new Set<BiometricOperation>([
  "financial_connection",
  "health_data",
  "change_consent",
  "sign_authorization",
  "delete_legacy",
  "voice_reconstruction",
  "avatar_reconstruction",
]);

export function validateBiometricAssertion(
  assertion: BiometricAssertion,
  expectedPersonId: string,
  expectedChallengeId: string,
  operation: BiometricOperation,
): { allowed: boolean; reason?: string } {
  if (assertion.personId !== expectedPersonId) return { allowed: false, reason: "person-mismatch" };
  if (assertion.challengeId !== expectedChallengeId) return { allowed: false, reason: "challenge-mismatch" };
  if (!assertion.userPresent || !assertion.userVerified) return { allowed: false, reason: "user-not-verified" };
  if (!assertion.credentialId || !assertion.provider || !assertion.providerVersion) return { allowed: false, reason: "incomplete-assertion" };

  if (HIGH_RISK.has(operation) && assertion.assurance !== "strong") {
    return { allowed: false, reason: "step-up-required" };
  }

  return { allowed: true };
}
