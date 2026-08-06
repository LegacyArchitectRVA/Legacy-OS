// LegacyOS Supabase client foundation
// Connects authentication, database, and future storage workflows.

export interface LegacyUser {
  id: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'contributor' | 'viewer';
}

export const createSupabaseClient = () => {
  return {
    status: 'configured',
    purpose: 'authentication and organization data access'
  };
};
