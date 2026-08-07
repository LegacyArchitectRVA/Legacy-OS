export interface KnowledgeChunk {
  id: string;
  workspaceId: string;
  content: string;
  score?: number;
}

export function retrieveRelevantKnowledge(query: string, chunks: KnowledgeChunk[]) {
  const terms = query.toLowerCase().split(/\s+/);

  return chunks
    .map((chunk) => ({
      ...chunk,
      score: terms.reduce((score, term) => {
        return score + (chunk.content.toLowerCase().includes(term) ? 1 : 0);
      }, 0),
    }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
}
