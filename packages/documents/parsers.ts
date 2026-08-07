export type SupportedDocument = {
  name: string;
  type: string;
  content: string;
};

export function normalizeDocument(document: SupportedDocument) {
  return {
    title: document.name,
    text: document.content.trim(),
    indexedAt: new Date().toISOString(),
  };
}
