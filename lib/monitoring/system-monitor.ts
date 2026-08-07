export type SystemHealth = {
  services: string[];
  checkedAt: string;
};

export function checkSystemHealth(): SystemHealth {
  return {
    services: ['database', 'ai', 'storage', 'authentication'],
    checkedAt: new Date().toISOString(),
  };
}
