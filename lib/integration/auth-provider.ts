export interface AuthUser {
  id: string;
  email: string;
  workspaceIds: string[];
}

export interface AuthSession {
  user: AuthUser;
  expiresAt: string;
}

export function createSession(user: AuthUser): AuthSession {
  return {
    user,
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  };
}
