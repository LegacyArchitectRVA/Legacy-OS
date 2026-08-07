export type KnowledgeType = 'sop' | 'template' | 'process' | 'document';

export type KnowledgeItem = {
  id: string;
  workspaceId: string;
  title: string;
  type: KnowledgeType;
  content: string;
  createdAt: string;
};

export type KnowledgeChunk = {
  id: string;
  knowledgeId: string;
  content: string;
  embedding?: number[];
};
