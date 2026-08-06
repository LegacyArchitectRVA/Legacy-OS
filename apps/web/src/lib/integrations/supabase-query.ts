export type WorkspaceContext = {
  organizationId: string;
  userId: string;
};

export function requireWorkspace(context: WorkspaceContext) {
  if (!context.organizationId || !context.userId) {
    throw new Error('Workspace context required');
  }

  return context;
}
