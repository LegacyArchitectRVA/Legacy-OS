export type DemoSession = {
  workspaceId: string;
  status: 'initialized' | 'active' | 'complete';
};

export function createDemoSession(workspaceId: string): DemoSession {
  return {
    workspaceId,
    status: 'initialized',
  };
}
