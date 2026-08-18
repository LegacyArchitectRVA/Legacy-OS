import type { RecallMemoryRecord } from "./recall";

const memoryStore: RecallMemoryRecord[] = [];

export function saveRecallMemory(memory: RecallMemoryRecord): RecallMemoryRecord {
  memoryStore.push(memory);
  return memory;
}

export function listRecallMemories(context?: RecallMemoryRecord["context"]): RecallMemoryRecord[] {
  return context ? memoryStore.filter((memory) => memory.context === context) : [...memoryStore];
}

export function getRecallMemory(id: string): RecallMemoryRecord | undefined {
  return memoryStore.find((memory) => memory.id === id);
}
