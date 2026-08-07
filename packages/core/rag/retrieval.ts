export type KnowledgeChunk = {
  id: string;
  content: string;
  source: string;
  score?: number;
};

export function buildContext(chunks: KnowledgeChunk[]) {
  return chunks.map((chunk) => chunk.content).join("\n\n");
}
