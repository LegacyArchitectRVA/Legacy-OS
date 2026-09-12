import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSupabaseServerClient } from "../../../../lib/supabase/server";
import { ApiRequestError, isRecord, jsonResponseHeaders, optionalString, parseJsonBody } from "../../../lib/api-request";

type RouteContext = { params: Promise<{ id: string }> };
const MAX_BODY_BYTES = 8 * 1024;

export async function PATCH(request: Request, { params }: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401, headers: jsonResponseHeaders() });

  try {
    const { id } = await params;
    const deviceId = id.trim();
    if (!deviceId) throw new ApiRequestError("Device id is required.");
    const body = await parseJsonBody<unknown>(request, MAX_BODY_BYTES);
    if (!isRecord(body)) throw new ApiRequestError("Request body must be a JSON object.");
    const name = optionalString(body.name, "name", 160);
    const status = optionalString(body.status, "status", 20);
    if (!name && !status) throw new ApiRequestError("name or status is required.");
    if (status && !new Set(["active", "revoked"]).has(status)) throw new ApiRequestError("Unsupported device status.");

    const supabase = await getSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503, headers: jsonResponseHeaders() });
    const { data: existing, error: lookupError } = await supabase
      .from("legacy_os_devices")
      .select("id,status,registered_by")
      .eq("id", deviceId)
      .maybeSingle();
    if (lookupError) return NextResponse.json({ error: "Unable to load device." }, { status: 500, headers: jsonResponseHeaders() });
    if (!existing) return NextResponse.json({ error: "Device not found." }, { status: 404, headers: jsonResponseHeaders() });

    if (status === "active" && existing.status !== "pending") {
      return NextResponse.json({ error: "Only a pending device can be activated." }, { status: 409, headers: jsonResponseHeaders() });
    }
    if (status === "active" && existing.registered_by !== user.id) {
      return NextResponse.json({ error: "Only the device registrant can activate a pending device." }, { status: 403, headers: jsonResponseHeaders() });
    }
    if (status === "revoked" && existing.status === "revoked") {
      return NextResponse.json({ error: "Device is already revoked." }, { status: 409, headers: jsonResponseHeaders() });
    }

    const update: Record<string, string> = {};
    if (name) update.name = name;
    if (status) update.status = status;
    const { data, error } = await supabase
      .from("legacy_os_devices")
      .update(update)
      .eq("id", deviceId)
      .select("id,workspace_id,name,platform,status,last_seen_at,created_at,updated_at")
      .single();
    if (error) return NextResponse.json({ error: "Unable to update device." }, { status: error.code === "42501" ? 403 : 500, headers: jsonResponseHeaders() });
    return NextResponse.json({ device: data }, { headers: jsonResponseHeaders() });
  } catch (error) {
    if (error instanceof ApiRequestError) return NextResponse.json({ error: error.message }, { status: error.status, headers: jsonResponseHeaders() });
    return NextResponse.json({ error: "Unable to update device." }, { status: 500, headers: jsonResponseHeaders() });
  }
}
