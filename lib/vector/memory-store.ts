export interface MemoryRecord {
  workspaceId: string;
  content: string;
  metadata: Record<string, string>;
}

export function indexMemory(record: MemoryRecord) {
  return {
    indexed: true,
    workspaceId: record.workspaceId,
    timestamp: new Date().toISOString(),
  };
}
