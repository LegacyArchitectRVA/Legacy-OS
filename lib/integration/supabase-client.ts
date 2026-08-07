// LegacyOS Supabase integration foundation

export interface DatabaseConfig {
  url: string;
  anonKey: string;
}

export function createDatabaseConfig(): DatabaseConfig {
  return {
    url: process.env.SUPABASE_URL ?? '',
    anonKey: process.env.SUPABASE_ANON_KEY ?? '',
  };
}
