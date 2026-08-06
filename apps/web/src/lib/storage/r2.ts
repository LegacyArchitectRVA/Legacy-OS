// Cloudflare R2 storage adapter foundation
// Production credentials are supplied through environment variables.

export interface StorageFile {
  key: string;
  url?: string;
}

export async function uploadDocument(file: StorageFile) {
  return {
    status: 'ready',
    key: file.key,
  };
}
