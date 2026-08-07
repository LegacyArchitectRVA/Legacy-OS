import { KnowledgeChunk, RetrievalContext } from './types';

export interface RetrievalRequest {
  workspaceId: string;
  query: string;
  limit?: number;
}

export interface KnowledgeSearchProvider {
  search(query: string, workspaceId: string, limit: number): Promise<KnowledgeChunk[]>;
}

export async function retrieveKnowledge(
  request: RetrievalRequest,
  provider: KnowledgeSearchProvider
): Promise<RetrievalContext> {
  const chunks = await provider.search(
    request.query,
    request.workspaceId,
    request.limit ?? 5
  );

  return {
    workspaceId: request.workspaceId,
    query: request.query,
    chunks,
    generatedAt: new Date().toISOString(),
  };
}
