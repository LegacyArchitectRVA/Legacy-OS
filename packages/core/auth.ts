export type WorkspaceUser = {
  id: string;
  email: string;
  workspaceId: string;
  role: 'owner' | 'admin' | 'member';
};

export type SessionContext = {
  user: WorkspaceUser;
};
