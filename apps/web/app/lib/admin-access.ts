import { createClient } from "@supabase/supabase-js";

export function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !secretKey) throw new Error("Supabase admin credentials are not configured.");
  return createClient(url, secretKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

export function isAdminEmail(email: string | undefined | null) {
  const configured = process.env.LEGACYOS_ADMIN_EMAILS ?? "";
  const allowed = configured.split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  return Boolean(email && allowed.includes(email.toLowerCase()));
}
