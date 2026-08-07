export interface DocumentRecord {
  id: string;
  workspaceId: string;
  name: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
}

export function queueDocument(document: DocumentRecord) {
  return {
    ...document,
    status: 'queued',
    queuedAt: new Date().toISOString(),
  };
}
