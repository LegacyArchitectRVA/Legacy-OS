export type KnowledgeSearchResult = {
  id: string;
  title: string;
  source: string;
  confidence: number;
};

export async function searchKnowledge(query: string): Promise<KnowledgeSearchResult[]> {
  if (!query.trim()) return [];

  return [];
}
