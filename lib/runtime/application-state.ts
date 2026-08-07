export type ApplicationState = {
  status: 'initializing' | 'ready' | 'error';
  workspaceId?: string;
  activeModules: string[];
};

export function createApplicationState(workspaceId?: string): ApplicationState {
  return {
    status: 'initializing',
    workspaceId,
    activeModules: [
      'knowledge',
      'assistant',
      'continuity',
      'automation'
    ]
  };
}
