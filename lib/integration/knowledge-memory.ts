export interface MemoryRecord {
  id: string;
  workspaceId: string;
  content: string;
  source: string;
  createdAt: string;
}

export function createMemoryRecord(input: Omit<MemoryRecord, 'createdAt'>): MemoryRecord {
  return {
    ...input,
    createdAt: new Date().toISOString(),
  };
}
