export type DocumentStage =
  | 'uploaded'
  | 'stored'
  | 'extracted'
  | 'classified'
  | 'indexed'
  | 'approved';

export interface KnowledgeDocument {
  id: string;
  organizationId: string;
  name: string;
  stage: DocumentStage;
}

export function nextDocumentStage(stage: DocumentStage): DocumentStage | null {
  const flow: DocumentStage[] = [
    'uploaded',
    'stored',
    'extracted',
    'classified',
    'indexed',
    'approved',
  ];

  const index = flow.indexOf(stage);
  return index >= 0 && index < flow.length - 1 ? flow[index + 1] : null;
}
