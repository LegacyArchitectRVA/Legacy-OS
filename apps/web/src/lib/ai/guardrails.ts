export const AI_GUARDRAILS = {
  groundedOnly: true,
  requireSources: true,
  identifyUnknowns: true,
  preserveVersionHistory: true,
  neverInventProcedures: true,
};

export function validateAIResponse(response: { sources?: unknown[]; confidence?: number }) {
  return Boolean(response.sources && response.confidence !== undefined);
}
