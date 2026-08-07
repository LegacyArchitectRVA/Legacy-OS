export type KnowledgeContext = {
  workspaceId: string;
  documents: string[];
  processes: string[];
  sops: string[];
};

export function buildBusinessBrainContext(input: KnowledgeContext) {
  return {
    workspaceId: input.workspaceId,
    knowledgeSources: [...input.documents, ...input.processes, ...input.sops],
    ready: true,
  };
}
