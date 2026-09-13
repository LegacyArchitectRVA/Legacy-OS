import { getSupabaseServerClient } from "./supabase/server";

export type MasterAccess = {
  authenticated: boolean;
  isMaster: boolean;
};

export async function getMasterAccess(): Promise<MasterAccess> {
  const supabase = await getSupabaseServerClient();
  if (!supabase) return { authenticated: false, isMaster: false };

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return { authenticated: false, isMaster: false };

  const { data: bootstrapped, error: bootstrapError } = await supabase.rpc("bootstrap_legacy_os_master_account");
  if (bootstrapError || bootstrapped !== true) return { authenticated: true, isMaster: false };

  const { data, error } = await supabase.rpc("get_legacy_os_master_status");
  if (error) return { authenticated: true, isMaster: false };

  return { authenticated: true, isMaster: data === true };
}
