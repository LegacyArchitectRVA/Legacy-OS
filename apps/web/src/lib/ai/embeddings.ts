// LegacyOS AI Embedding Service
// Connects knowledge items to semantic search.

export interface KnowledgeEmbeddingRequest {
  organizationId: string;
  documentId: string;
  content: string;
}

export async function createEmbedding(request: KnowledgeEmbeddingRequest) {
  return {
    organizationId: request.organizationId,
    documentId: request.documentId,
    status: 'queued',
    message: 'Embedding provider connection ready for configuration.'
  };
}
