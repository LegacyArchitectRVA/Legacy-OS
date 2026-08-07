export type MemoryEntry = {
  id: string;
  workspaceId: string;
  type: 'preference' | 'decision' | 'insight' | 'history';
  content: string;
  createdAt: string;
};

export function createMemoryEntry(input: Omit<MemoryEntry, 'id' | 'createdAt'>): MemoryEntry {
  return {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
}
