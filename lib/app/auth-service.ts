export type UserRole = 'owner' | 'admin' | 'member';

export interface UserSession {
  id: string;
  email: string;
  role: UserRole;
  workspaceId: string;
}

export function createSession(user: UserSession) {
  return {
    authenticated: true,
    user,
    createdAt: new Date().toISOString(),
  };
}
