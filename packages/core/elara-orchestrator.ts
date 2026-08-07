export type ElaraRequest = {
  userId?: string;
  workspaceId?: string;
  message: string;
};

export type ElaraResponse = {
  guidance: string;
  recommendedActions: string[];
  contextNeeded: string[];
};

export function createElaraResponse(request: ElaraRequest): ElaraResponse {
  return {
    guidance: `Elara is processing: ${request.message}`,
    recommendedActions: [],
    contextNeeded: []
  };
}
