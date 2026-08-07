export type WorkspaceRole = 'owner' | 'advisor' | 'successor';

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  roles: WorkspaceRole[];
  createdAt: string;
}

export interface BusinessProfile {
  workspaceId: string;
  businessName: string;
  industry?: string;
  mission?: string;
  criticalProcesses: string[];
}
