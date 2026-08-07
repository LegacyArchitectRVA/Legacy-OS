export type Role = 'owner' | 'admin' | 'member';

export interface PermissionCheck {
  role: Role;
  action: string;
}

const permissions: Record<Role, string[]> = {
  owner: ['*'],
  admin: ['manage_workspace', 'manage_documents', 'view_reports'],
  member: ['view_documents', 'ask_ai']
};

export function canAccess({ role, action }: PermissionCheck): boolean {
  return permissions[role].includes('*') || permissions[role].includes(action);
}
