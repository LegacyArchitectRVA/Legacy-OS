export interface AIContext {
  workspaceId: string;
  question: string;
  knowledge: string[];
}

export interface AIResponse {
  answer: string;
  confidence: number;
  sources: string[];
}

export async function generateResponse(context: AIContext): Promise<AIResponse> {
  return {
    answer: `Prepared response for workspace ${context.workspaceId}: ${context.question}`,
    confidence: context.knowledge.length ? 0.8 : 0.4,
    sources: context.knowledge,
  };
}
