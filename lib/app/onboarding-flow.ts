export interface OnboardingProfile {
  ownerName: string;
  businessName: string;
  goals: string[];
}

export function createWorkspaceProfile(profile: OnboardingProfile) {
  return {
    id: crypto.randomUUID(),
    ...profile,
    createdAt: new Date().toISOString(),
  };
}
