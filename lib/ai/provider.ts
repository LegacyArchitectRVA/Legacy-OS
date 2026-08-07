export interface AIProviderRequest {
  prompt: string;
  context: string;
  workspaceId: string;
}

export interface AIProviderResponse {
  content: string;
  confidence: number;
  sources: string[];
}

export interface AIProvider {
  generate(request: AIProviderRequest): Promise<AIProviderResponse>;
}

export function createAIRequest(prompt: string, context: string, workspaceId: string): AIProviderRequest {
  return { prompt, context, workspaceId };
}
