export interface DocumentProcessingJob {
  workspaceId: string;
  documentId: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
}

export function createDocumentJob(workspaceId: string, documentId: string): DocumentProcessingJob {
  return {
    workspaceId,
    documentId,
    status: 'queued',
  };
}

export function markProcessing(job: DocumentProcessingJob): DocumentProcessingJob {
  return { ...job, status: 'processing' };
}
