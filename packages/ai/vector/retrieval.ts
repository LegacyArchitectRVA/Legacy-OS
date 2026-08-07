export type KnowledgeChunk = {
  id: string;
  content: string;
  embedding?: number[];
  metadata: Record<string, unknown>;
};

export function buildRetrievalContext(chunks: KnowledgeChunk[]) {
  return chunks.map((chunk) => chunk.content).join("\n\n");
}
