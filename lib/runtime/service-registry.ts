export type ServiceName =
  | 'knowledge'
  | 'assistant'
  | 'continuity'
  | 'automation'
  | 'audit';

export interface ServiceStatus {
  service: ServiceName;
  enabled: boolean;
  initialized: boolean;
}

export function getServiceRegistry(): ServiceStatus[] {
  return [
    { service: 'knowledge', enabled: true, initialized: true },
    { service: 'assistant', enabled: true, initialized: true },
    { service: 'continuity', enabled: true, initialized: true },
    { service: 'automation', enabled: true, initialized: true },
    { service: 'audit', enabled: true, initialized: true },
  ];
}
