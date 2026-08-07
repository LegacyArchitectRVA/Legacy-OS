export interface UserRecord {
  id: string;
  email: string;
  workspaceId: string;
}

export interface WorkspaceRecord {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
}

export interface DocumentRecord {
  id: string;
  workspaceId: string;
  name: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
}

export interface ReadinessRecord {
  workspaceId: string;
  score: number;
  risks: string[];
}
