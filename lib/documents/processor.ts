export type ProcessingStatus = 'queued' | 'processing' | 'complete' | 'failed';

export interface DocumentJob {
  id: string;
  workspaceId: string;
  documentId: string;
  status: ProcessingStatus;
}

export function createProcessingJob(workspaceId: string, documentId: string): DocumentJob {
  return {
    id: crypto.randomUUID(),
    workspaceId,
    documentId,
    status: 'queued'
  };
}
