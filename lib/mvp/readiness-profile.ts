export type ReadinessProfile = {
  digitalLife: number;
  financialAssets: number;
  householdProperty: number;
  healthMedical: number;
  legalEstate: number;
  businessContinuity: number;
  legacyWishes: number;
};

export function calculateReadiness(profile: ReadinessProfile) {
  const values = Object.values(profile);
  const score = Math.round(values.reduce((a, b) => a + b, 0) / values.length);

  return {
    score,
    status: score >= 80 ? 'ready' : score >= 50 ? 'needs-attention' : 'critical',
  };
}
