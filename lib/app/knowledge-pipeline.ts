export interface KnowledgePipelineResult {
  documentId: string;
  extractedContent: string;
  indexed: boolean;
}

export function processKnowledgeInput(documentId: string, content: string): KnowledgePipelineResult {
  return {
    documentId,
    extractedContent: content.trim(),
    indexed: true,
  };
}
