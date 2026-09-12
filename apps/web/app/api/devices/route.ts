import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSupabaseServerClient } from "../../../lib/supabase/server";
import { ApiRequestError, isRecord, jsonResponseHeaders, parseJsonBody, requiredString } from "../../lib/api-request";

const MAX_BODY_BYTES = 16 * 1024;
const MAX_FINGERPRINT_LENGTH = 256;
const PLATFORMS = new Set(["windows", "macos", "linux", "android", "ios", "nas", "unknown"]);

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401, headers: jsonResponseHeaders() });
  void user;

  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503, headers: jsonResponseHeaders() });

  const { data, error } = await supabase
    .from("legacy_os_devices")
    .select("id,workspace_id,name,platform,status,last_seen_at,created_at,updated_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Unable to load authorized devices." }, { status: 500, headers: jsonResponseHeaders() });
  return NextResponse.json({ devices: data ?? [] }, { headers: jsonResponseHeaders() });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401, headers: jsonResponseHeaders() });

  try {
    const body = await parseJsonBody<unknown>(request, MAX_BODY_BYTES);
    if (!isRecord(body)) throw new ApiRequestError("Request body must be a JSON object.");
    const workspaceId = requiredString(body.workspace_id, "workspace_id", 64);
    const name = requiredString(body.name, "name", 160);
    const fingerprint = requiredString(body.device_key_fingerprint, "device_key_fingerprint", MAX_FINGERPRINT_LENGTH);
    const platform = requiredString(body.platform, "platform", 20).toLowerCase();
    if (!PLATFORMS.has(platform)) throw new ApiRequestError("Unsupported device platform.");

    const supabase = await getSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503, headers: jsonResponseHeaders() });
    const { data, error } = await supabase
      .from("legacy_os_devices")
      .insert({ workspace_id: workspaceId, registered_by: user.id, name, platform, device_key_fingerprint: fingerprint, status: "pending" })
      .select("id,workspace_id,name,platform,status,last_seen_at,created_at,updated_at")
      .single();
    if (error) {
      const status = error.code === "42501" ? 403 : error.code === "23505" ? 409 : 500;
      return NextResponse.json({ error: status === 409 ? "That device is already registered." : "Unable to register device." }, { status, headers: jsonResponseHeaders() });
    }
    return NextResponse.json({ device: data }, { status: 201, headers: jsonResponseHeaders() });
  } catch (error) {
    if (error instanceof ApiRequestError) return NextResponse.json({ error: error.message }, { status: error.status, headers: jsonResponseHeaders() });
    return NextResponse.json({ error: "Unable to register device." }, { status: 500, headers: jsonResponseHeaders() });
  }
}
