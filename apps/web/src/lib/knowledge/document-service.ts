export type DocumentStatus = 'uploaded' | 'processing' | 'indexed' | 'failed';

export interface KnowledgeDocument {
  id: string;
  organizationId: string;
  name: string;
  category: string;
  status: DocumentStatus;
  sourceUrl?: string;
}

export async function createKnowledgeDocument(input: KnowledgeDocument) {
  return {
    ...input,
    createdAt: new Date().toISOString(),
  };
}
