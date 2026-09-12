import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSupabaseServerClient } from "../../../lib/supabase/server";

const MAX_BODY_BYTES = 16 * 1024;
const MAX_NAME_LENGTH = 160;
const MAX_FINGERPRINT_LENGTH = 256;
const PLATFORMS = new Set(["windows", "macos", "linux", "android", "ios", "nas", "unknown"]);

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("legacy_os_devices")
    .select("id,workspace_id,name,platform,status,last_seen_at,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Unable to load authorized devices." }, { status: 500 });
  }

  return NextResponse.json({ devices: data ?? [] }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) return badRequest("Request body is too large.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) return badRequest("Invalid request body.");
  const input = body as Record<string, unknown>;
  const workspaceId = typeof input.workspace_id === "string" ? input.workspace_id.trim() : "";
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const platform = typeof input.platform === "string" ? input.platform.trim().toLowerCase() : "";
  const fingerprint = typeof input.device_key_fingerprint === "string" ? input.device_key_fingerprint.trim() : "";

  if (!workspaceId || !name || !fingerprint || !PLATFORMS.has(platform)) {
    return badRequest("workspace_id, name, device_key_fingerprint, and a supported platform are required.");
  }
  if (name.length > MAX_NAME_LENGTH || fingerprint.length > MAX_FINGERPRINT_LENGTH) {
    return badRequest("Device metadata exceeds the allowed length.");
  }

  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("legacy_os_devices")
    .insert({
      workspace_id: workspaceId,
      registered_by: user.id,
      name,
      platform,
      device_key_fingerprint: fingerprint,
      status: "pending",
    })
    .select("id,workspace_id,name,platform,status,last_seen_at,created_at,updated_at")
    .single();

  if (error) {
    const status = error.code === "42501" ? 403 : error.code === "23505" ? 409 : 500;
    return NextResponse.json({ error: status === 409 ? "That device is already registered." : "Unable to register device." }, { status });
  }

  return NextResponse.json({ device: data }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
