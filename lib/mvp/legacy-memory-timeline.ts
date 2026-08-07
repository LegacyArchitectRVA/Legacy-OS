export interface MemoryEvent {
  id: string;
  workspaceId: string;
  category: string;
  createdAt: string;
  summary: string;
}

export function addMemoryEvent(event: MemoryEvent): MemoryEvent {
  return event;
}
