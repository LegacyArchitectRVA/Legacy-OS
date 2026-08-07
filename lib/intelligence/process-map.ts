export interface ProcessNode {
  id: string;
  name: string;
  owner?: string;
  dependencies: string[];
  criticality: 'low' | 'medium' | 'high' | 'critical';
}

export interface ProcessMap {
  workspaceId: string;
  processes: ProcessNode[];
}

export function findCriticalProcesses(map: ProcessMap): ProcessNode[] {
  return map.processes.filter((process) => process.criticality === 'critical');
}
