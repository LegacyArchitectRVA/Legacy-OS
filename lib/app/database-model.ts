export interface UserRecord {
  id: string;
  email: string;
  workspaceId: string;
  role: 'owner' | 'admin' | 'member';
}

export interface WorkspaceRecord {
  id: string;
  name: string;
  createdAt: string;
}

export interface DocumentRecord {
  id: string;
  workspaceId: string;
  name: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
}

export interface KnowledgeRecord {
  id: string;
  workspaceId: string;
  sourceDocumentId?: string;
  content: string;
}
