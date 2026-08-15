export interface AvatarReference {
  subjectPersonId: string;
  sourceIds: readonly string[];
  modelProvider: string;
  modelVersion: string;
  consentRequired: true;
  consentGranted: boolean;
}

export interface AvatarPlan {
  reference: AvatarReference;
  expressionProfile: "neutral" | "documented" | "reconstructed";
  gestureProfile: "none" | "documented" | "reconstructed";
}

export function createAvatarPlan(reference: AvatarReference): AvatarPlan {
  if (!reference.consentGranted) {
    throw new Error("Avatar reconstruction requires explicit consent");
  }
  if (reference.sourceIds.length === 0) {
    throw new Error("Avatar reconstruction requires source evidence");
  }

  return {
    reference,
    expressionProfile: "reconstructed",
    gestureProfile: "reconstructed",
  };
}
