export type ElaraPipelineRequest = {
  userId: string;
  workspaceId: string;
  question: string;
  context?: string[];
};

export type ElaraPipelineResponse = {
  answer: string;
  recommendations: string[];
  nextActions: string[];
};

export function createElaraResponse(input: ElaraPipelineRequest): ElaraPipelineResponse {
  return {
    answer: `Elara is processing: ${input.question}`,
    recommendations: [],
    nextActions: []
  };
}
