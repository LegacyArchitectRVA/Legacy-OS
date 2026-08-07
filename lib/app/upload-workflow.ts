export type UploadStatus = 'queued' | 'processing' | 'complete' | 'failed';

export type KnowledgeUpload = {
  id: string;
  workspaceId: string;
  filename: string;
  status: UploadStatus;
};

export function queueUpload(filename: string, workspaceId: string): KnowledgeUpload {
  return {
    id: crypto.randomUUID(),
    workspaceId,
    filename,
    status: 'queued',
  };
}
