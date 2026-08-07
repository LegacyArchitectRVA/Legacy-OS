export interface KnowledgeRecord {
  id: string;
  workspaceId: string;
  content: string;
  source: string;
}

export function indexKnowledge(record: KnowledgeRecord) {
  return {
    ...record,
    indexedAt: new Date().toISOString(),
  };
}
