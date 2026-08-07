export type ElaraRequest = {
  workspaceId: string;
  userId?: string;
  message: string;
  context?: Record<string, unknown>;
};

export type ElaraResponse = {
  summary: string;
  recommendations: string[];
  nextActions: string[];
};

export function createElaraResponse(input: ElaraRequest): ElaraResponse {
  return {
    summary: `Elara received: ${input.message}`,
    recommendations: [],
    nextActions: []
  };
}
