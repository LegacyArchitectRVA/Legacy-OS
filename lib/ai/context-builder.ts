export type AIContext = {
  workspaceId: string;
  documents: string[];
  memories: string[];
  instructions: string[];
};

export function buildAIContext(input: AIContext) {
  return {
    workspace: input.workspaceId,
    knowledge: [...input.documents, ...input.memories],
    instructions: input.instructions,
  };
}
