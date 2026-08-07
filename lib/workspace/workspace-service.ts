export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  industry?: string;
}

export function createWorkspace(name: string, ownerId: string): Workspace {
  return {
    id: crypto.randomUUID(),
    name,
    ownerId,
  };
}

export function getWorkspaceContext(workspace: Workspace) {
  return {
    workspaceId: workspace.id,
    workspaceName: workspace.name,
    industry: workspace.industry ?? null,
  };
}
