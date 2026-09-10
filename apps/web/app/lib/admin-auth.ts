import { createServerClient } from "@supabase/ssr";

function parseCookies(request: Request) {
  const header = request.headers.get("cookie") ?? "";
  return header
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separator = part.indexOf("=");
      return separator === -1
        ? { name: part, value: "" }
        : { name: part.slice(0, separator), value: decodeURIComponent(part.slice(separator + 1)) };
    });
}

export async function isAdminRequest(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => parseCookies(request),
      setAll: () => undefined,
    },
  });

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email || !data.user.email_confirmed_at) return false;

  const admins = (process.env.LEGACYOS_ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  return admins.includes(data.user.email.toLowerCase());
}

export function validateUserCredentials(email: string, password: string) {
  return /.+@.+\..+/.test(email) && password.length >= 12;
}
