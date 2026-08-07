export type KnowledgeSourceType =
  | 'pdf'
  | 'docx'
  | 'txt'
  | 'markdown'
  | 'manual';

export interface KnowledgeDocument {
  id: string;
  workspaceId: string;
  title: string;
  category?: string;
  sourceType: KnowledgeSourceType;
  content: string;
  version: number;
}

export interface KnowledgeChunk {
  id: string;
  documentId: string;
  content: string;
  index: number;
}

export interface RetrievalContext {
  workspaceId: string;
  query: string;
  documents: KnowledgeChunk[];
}
