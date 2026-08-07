export type SystemHealth = {
  workspaceReady: boolean;
  knowledgeReady: boolean;
  assessmentReady: boolean;
  assistantReady: boolean;
};

export function calculateSystemHealth(state: SystemHealth) {
  const checks = Object.values(state);
  const complete = checks.filter(Boolean).length;

  return {
    complete,
    total: checks.length,
    percentage: Math.round((complete / checks.length) * 100),
    ready: complete === checks.length,
  };
}
