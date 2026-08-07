export type UploadRequest = {
  workspaceId: string;
  filename: string;
  contentType: string;
};

export type UploadResult = {
  documentId: string;
  status: 'queued' | 'processing' | 'complete' | 'failed';
};

export async function queueDocumentUpload(
  request: UploadRequest
): Promise<UploadResult> {
  return {
    documentId: crypto.randomUUID(),
    status: 'queued',
  };
}
