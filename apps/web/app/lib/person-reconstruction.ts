export type ReconstructionPermission = "approved" | "revoked" | "pending";

export type PersonReconstructionProfile = {
  id: string;
  displayName: string;
  /** Name the recreation should normally use when addressing the user. */
  userName?: string;
  /** Nicknames found in preserved memories or explicitly approved by the user. */
  userNicknames?: string[];
  portraitUri?: string;
  voiceProfileId?: string;
  permission: ReconstructionPermission;
  identityEvidence: string[];
  voiceEvidence: string[];
  personalityEvidence: string[];
  memorySourceIds: string[];
  sceneIds: string[];
  reconstructionNotes?: string;
};

export type VoiceIdentityMatch = {
  sourceId: string;
  personId: string;
  confidence: number;
  matchedSpeaker: string;
  signals: string[];
  status: "candidate" | "supported" | "verified";
};

/**
 * Voice recognition results are evidence, not proof of identity. The app should
 * preserve the recognition confidence and source so a human can review it.
 */
export function createVoiceIdentityMatch(input: Omit<VoiceIdentityMatch, "status">): VoiceIdentityMatch {
  const status = input.confidence >= 0.9 ? "verified" : input.confidence >= 0.7 ? "supported" : "candidate";
  return { ...input, status };
}

/** Select the name or approved nickname to use when addressing the user. */
export function preferredUserAddress(profile: PersonReconstructionProfile, memoryNicknames: string[] = []): string {
  const approved = new Set((profile.userNicknames ?? []).map((name) => name.trim()).filter(Boolean));
  for (const nickname of memoryNicknames) {
    if (approved.has(nickname.trim())) return nickname.trim();
  }
  return profile.userName?.trim() || profile.displayName;
}

export type ReconstructionReadiness = {
  personId: string;
  ready: boolean;
  score: number;
  missing: string[];
  strengths: string[];
};

export function assessReconstructionReadiness(profile: PersonReconstructionProfile): ReconstructionReadiness {
  const missing: string[] = [];
  const strengths: string[] = [];
  if (profile.permission !== "approved") missing.push("approved recreation permission");
  if (profile.identityEvidence.length === 0) missing.push("identity evidence");
  else strengths.push("identity evidence");
  if (profile.voiceEvidence.length === 0) missing.push("voice evidence");
  else strengths.push("voice evidence");
  if (profile.personalityEvidence.length === 0) missing.push("personality evidence");
  else strengths.push("personality evidence");
  if (profile.memorySourceIds.length === 0) missing.push("preserved memories");
  else strengths.push("preserved memories");
  if (profile.sceneIds.length === 0) missing.push("reconstructable scenes");
  else strengths.push("reconstructable scenes");

  const score = Math.round(((6 - missing.length) / 6) * 100);
  return { personId: profile.id, ready: missing.length === 0, score, missing, strengths };
}
