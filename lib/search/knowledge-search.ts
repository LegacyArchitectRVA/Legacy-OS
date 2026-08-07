export interface KnowledgeResult {
  id: string;
  title: string;
  content: string;
  relevance: number;
}

export async function searchKnowledge(query: string, workspaceId: string): Promise<KnowledgeResult[]> {
  return [
    {
      id: 'placeholder',
      title: `Knowledge search for ${workspaceId}`,
      content: query,
      relevance: 0
    }
  ];
}
