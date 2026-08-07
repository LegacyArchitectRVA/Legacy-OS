export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
}

export interface DocumentRecord {
  id: string;
  workspaceId: string;
  name: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
}

export interface KnowledgeEntry {
  id: string;
  workspaceId: string;
  sourceDocumentId?: string;
  content: string;
  category: string;
}

export interface Conversation {
  id: string;
  workspaceId: string;
  question: string;
  response: string;
}
