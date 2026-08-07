export interface ElaraMemory {
  workspaceId: string;
  userId?: string;
  memories: string[];
  preferences: Record<string, string>;
  lastUpdated: string;
}

export function createElaraMemory(workspaceId: string): ElaraMemory {
  return {
    workspaceId,
    memories: [],
    preferences: {},
    lastUpdated: new Date().toISOString(),
  };
}
