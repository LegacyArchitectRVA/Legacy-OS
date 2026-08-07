export type ProcessingStatus = 'queued' | 'processing' | 'complete' | 'failed';

export interface ProcessedDocument {
  id: string;
  text: string;
  metadata: Record<string, string>;
}

export function prepareDocument(content: string): ProcessedDocument {
  return {
    id: crypto.randomUUID(),
    text: content.trim(),
    metadata: {
      processedAt: new Date().toISOString()
    }
  };
}
