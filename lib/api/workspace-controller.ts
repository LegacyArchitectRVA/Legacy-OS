export interface WorkspaceRequest {
  workspaceId: string;
  action: string;
}

export interface WorkspaceResponse {
  workspaceId: string;
  status: 'ready' | 'pending';
}

export function handleWorkspace(request: WorkspaceRequest): WorkspaceResponse {
  return {
    workspaceId: request.workspaceId,
    status: 'ready',
  };
}
