// LegacyOS Authentication Foundation

export type UserRole = 'owner' | 'admin' | 'member';

export interface UserSession {
  userId: string;
  workspaceId: string;
  role: UserRole;
}

export function createSession(userId: string, workspaceId: string, role: UserRole): UserSession {
  return {
    userId,
    workspaceId,
    role,
  };
}
