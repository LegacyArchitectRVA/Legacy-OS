export type KnowledgeMatch = {
  id: string;
  source: string;
  relevance: number;
  content: string;
};

export function retrieveKnowledge(query: string, knowledge: KnowledgeMatch[]) {
  return knowledge
    .map((item) => ({
      ...item,
      relevance: item.content.toLowerCase().includes(query.toLowerCase())
        ? 1
        : item.relevance,
    }))
    .sort((a, b) => b.relevance - a.relevance);
}
