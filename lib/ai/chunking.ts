import type { KnowledgeChunk } from './types';

/**
 * Splits operational knowledge into retrieval-friendly chunks.
 * Production version will add token-aware splitting and embeddings.
 */
export function chunkDocument(
  documentId: string,
  content: string,
  chunkSize = 800
): KnowledgeChunk[] {
  const chunks: KnowledgeChunk[] = [];
  const words = content.split(/\s+/);

  for (let i = 0; i < words.length; i += chunkSize) {
    chunks.push({
      id: `${documentId}-${chunks.length + 1}`,
      documentId,
      content: words.slice(i, i + chunkSize).join(' '),
      index: chunks.length,
    });
  }

  return chunks;
}
