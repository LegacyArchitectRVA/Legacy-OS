export type KnowledgeSourceType = 'document' | 'sop' | 'template' | 'decision';

export interface KnowledgeSource {
  id: string;
  workspaceId: string;
  type: KnowledgeSourceType;
  title: string;
  contentReference: string;
  tags: string[];
  status: 'queued' | 'processing' | 'ready' | 'failed';
}

export function createKnowledgeSource(title: string, workspaceId: string): KnowledgeSource {
  return {
    id: crypto.randomUUID(),
    workspaceId,
    type: 'document',
    title,
    contentReference: '',
    tags: [],
    status: 'queued',
  };
}
