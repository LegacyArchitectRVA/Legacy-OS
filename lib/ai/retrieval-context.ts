export interface RetrievalContext {
  workspaceId: string;
  query: string;
  sources: RetrievalSource[];
  createdAt: string;
}

export interface RetrievalSource {
  id: string;
  title: string;
  type: 'document' | 'sop' | 'template' | 'decision';
  relevanceScore: number;
}

export function buildRetrievalContext(workspaceId: string, query: string): RetrievalContext {
  return {
    workspaceId,
    query,
    sources: [],
    createdAt: new Date().toISOString(),
  };
}
