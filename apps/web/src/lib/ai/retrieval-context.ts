export type RetrievalContext = {
  query: string;
  organizationId: string;
  sources: string[];
};

export function createRetrievalContext(input: RetrievalContext) {
  return {
    ...input,
    grounded: true,
    createdAt: new Date().toISOString(),
  };
}
