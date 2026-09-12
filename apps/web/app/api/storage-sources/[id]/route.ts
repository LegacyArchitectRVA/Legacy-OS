import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSupabaseServerClient } from "../../../../lib/supabase/server";
import { ApiRequestError, isRecord, jsonResponseHeaders, optionalString, parseJsonBody } from "../../../../lib/api-request";

type RouteContext = { params: Promise<{ id: string }> };
const MAX_BODY_BYTES = 8 * 1024;
const ALLOWED_STATUS = new Set(["active", "paused", "revoked", "error"]);

export async function PATCH(request: Request, { params }: RouteContext) {
  if (!await getAuthenticatedUser()) return NextResponse.json({ error: "Authentication is required." }, { status: 401, headers: jsonResponseHeaders() });

  try {
    const { id } = await params;
    const sourceId = id.trim();
    if (!sourceId) throw new ApiRequestError("Storage source id is required.");
    const body = await parseJsonBody<unknown>(request, MAX_BODY_BYTES);
    if (!isRecord(body)) throw new ApiRequestError("Request body must be a JSON object.");
    const name = optionalString(body.name, "name", 160);
    const status = optionalString(body.status, "status", 20);
    if (!name && !status) throw new ApiRequestError("name or status is required.");
    if (status && !ALLOWED_STATUS.has(status)) throw new ApiRequestError("Unsupported storage source status.");

    const supabase = await getSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503, headers: jsonResponseHeaders() });
    const { data: existing, error: lookupError } = await supabase
      .from("legacy_os_storage_sources")
      .select("id,status")
      .eq("id", sourceId)
      .maybeSingle();
    if (lookupError) return NextResponse.json({ error: "Unable to load storage source." }, { status: 500, headers: jsonResponseHeaders() });
    if (!existing) return NextResponse.json({ error: "Storage source not found." }, { status: 404, headers: jsonResponseHeaders() });

    if (status === existing.status) return NextResponse.json({ error: "Storage source is already in that state." }, { status: 409, headers: jsonResponseHeaders() });
    if (existing.status === "revoked") return NextResponse.json({ error: "A revoked storage source cannot be reactivated." }, { status: 409, headers: jsonResponseHeaders() });
    if (status === "active" && !["pending", "paused", "error"].includes(existing.status)) {
      return NextResponse.json({ error: "Storage source cannot be activated from its current state." }, { status: 409, headers: jsonResponseHeaders() });
    }

    const update: Record<string, string> = {};
    if (name) update.name = name;
    if (status) update.status = status;
    const { data, error } = await supabase
      .from("legacy_os_storage_sources")
      .update(update)
      .eq("id", sourceId)
      .select("id,workspace_id,device_id,name,source_type,provider,root_reference,status,last_sync_at,created_at,updated_at")
      .single();
    if (error) return NextResponse.json({ error: "Unable to update storage source." }, { status: error.code === "42501" ? 403 : 500, headers: jsonResponseHeaders() });
    return NextResponse.json({ source: data }, { headers: jsonResponseHeaders() });
  } catch (error) {
    if (error instanceof ApiRequestError) return NextResponse.json({ error: error.message }, { status: error.status, headers: jsonResponseHeaders() });
    return NextResponse.json({ error: "Unable to update storage source." }, { status: 500, headers: jsonResponseHeaders() });
  }
}
