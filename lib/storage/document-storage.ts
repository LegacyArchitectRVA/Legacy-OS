// LegacyOS Document Storage Foundation

export interface StoredDocument {
  id: string;
  workspaceId: string;
  filename: string;
  contentType: string;
  status: 'uploaded' | 'processing' | 'indexed';
}

export function createDocumentRecord(
  id: string,
  workspaceId: string,
  filename: string,
  contentType: string
): StoredDocument {
  return {
    id,
    workspaceId,
    filename,
    contentType,
    status: 'uploaded',
  };
}
