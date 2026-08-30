export type ReconstructionPermission = "approved" | "revoked" | "pending";

export type PersonReconstructionProfile = {
  id: string;
  displayName: string;
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
