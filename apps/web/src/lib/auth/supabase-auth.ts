// LegacyOS Supabase authentication foundation

export type UserRole = 'owner' | 'administrator' | 'contributor' | 'viewer';

export interface LegacyUser {
  id: string;
  email: string;
  organizationId: string;
  role: UserRole;
}

export function hasPermission(role: UserRole, action: string): boolean {
  const permissions: Record<UserRole, string[]> = {
    owner: ['manage', 'edit', 'view'],
    administrator: ['edit', 'view'],
    contributor: ['edit', 'view'],
    viewer: ['view']
  };

  return permissions[role]?.includes(action) ?? false;
}
