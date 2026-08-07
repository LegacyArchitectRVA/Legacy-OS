export type ReadinessCheck = {
  name: string;
  ready: boolean;
  notes?: string;
};

export function evaluateLaunchReadiness(checks: ReadinessCheck[]) {
  const complete = checks.filter((check) => check.ready).length;

  return {
    total: checks.length,
    complete,
    percentage: checks.length ? Math.round((complete / checks.length) * 100) : 0,
    checks,
  };
}
