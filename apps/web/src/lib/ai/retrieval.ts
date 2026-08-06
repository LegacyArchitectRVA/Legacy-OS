export interface KnowledgeResult {
  content: string;
  source: string;
  confidence: number;
}

export async function retrieveKnowledge(query: string): Promise<KnowledgeResult[]> {
  return [
    {
      content: `Knowledge search initialized for: ${query}`,
      source: 'Business Brain',
      confidence: 0,
    },
  ];
}
