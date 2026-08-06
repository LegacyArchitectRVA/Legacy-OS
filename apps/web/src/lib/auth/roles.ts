export const roles = {
  owner: 'Owner',
  admin: 'Administrator',
  contributor: 'Contributor',
  viewer: 'Viewer',
} as const;

export type LegacyRole = keyof typeof roles;

export function canManageWorkspace(role: LegacyRole) {
  return role === 'owner' || role === 'admin';
}
