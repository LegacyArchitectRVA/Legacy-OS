import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSupabaseServerClient } from "../../../lib/supabase/server";
import { ApiRequestError, isRecord, jsonResponseHeaders, optionalString, parseJsonBody, requiredString } from "../../../lib/api-request";

const MAX_BODY_BYTES = 24 * 1024;
const SOURCE_TYPES = new Set(["local_filesystem", "external_drive", "nas", "cloud_storage", "provider_api"]);

export async function GET() {
  if (!await getAuthenticatedUser()) return NextResponse.json({ error: "Authentication is required." }, { status: 401, headers: jsonResponseHeaders() });
  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503, headers: jsonResponseHeaders() });
  const { data, error } = await supabase
    .from("legacy_os_storage_sources")
    .select("id,workspace_id,device_id,name,source_type,provider,root_reference,status,last_sync_at,created_at,updated_at")
    .order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: "Unable to load storage sources." }, { status: 500, headers: jsonResponseHeaders() });
  return NextResponse.json({ sources: data ?? [] }, { headers: jsonResponseHeaders() });
}

export async function POST(request: Request) {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401, headers: jsonResponseHeaders() });

  try {
    const body = await parseJsonBody<unknown>(request, MAX_BODY_BYTES);
    if (!isRecord(body)) throw new ApiRequestError("Request body must be a JSON object.");
    const workspaceId = requiredString(body.workspace_id, "workspace_id", 64);
    const name = requiredString(body.name, "name", 160);
    const sourceType = requiredString(body.source_type, "source_type", 32);
    if (!SOURCE_TYPES.has(sourceType)) throw new ApiRequestError("Unsupported storage source type.");
    const deviceId = optionalString(body.device_id, "device_id", 64) ?? null;
    const provider = optionalString(body.provider, "provider", 120) ?? null;
    const rootReference = optionalString(body.root_reference, "root_reference", 2048) ?? null;
    const credentialReference = optionalString(body.credential_reference, "credential_reference", 512) ?? null;
    if (credentialReference && /(password|secret|token|api[_-]?key|private[_-]?key)\s*[:=]/i.test(credentialReference)) {
      throw new ApiRequestError("Raw credentials must not be submitted as a credential reference.");
    }

    const supabase = await getSupabaseServerClient();
    if (!supabase) return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503, headers: jsonResponseHeaders() });
    const { data, error } = await supabase
      .from("legacy_os_storage_sources")
      .insert({ workspace_id: workspaceId, device_id: deviceId, created_by: user.id, name, source_type: sourceType, provider, root_reference: rootReference, credential_reference: credentialReference, status: "pending" })
      .select("id,workspace_id,device_id,name,source_type,provider,root_reference,status,last_sync_at,created_at,updated_at")
      .single();
    if (error) return NextResponse.json({ error: error.code === "42501" ? "Storage source is not authorized for this workspace." : "Unable to register storage source." }, { status: error.code === "42501" ? 403 : 500, headers: jsonResponseHeaders() });
    return NextResponse.json({ source: data }, { status: 201, headers: jsonResponseHeaders() });
  } catch (error) {
    if (error instanceof ApiRequestError) return NextResponse.json({ error: error.message }, { status: error.status, headers: jsonResponseHeaders() });
    return NextResponse.json({ error: "Unable to register storage source." }, { status: 500, headers: jsonResponseHeaders() });
  }
}
