export type SystemHealth = {
  service: string;
  status: 'ready' | 'warning' | 'offline';
  checkedAt: string;
};

export function createHealthCheck(service: string): SystemHealth {
  return {
    service,
    status: 'ready',
    checkedAt: new Date().toISOString(),
  };
}
