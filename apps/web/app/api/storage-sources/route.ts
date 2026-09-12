import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSupabaseServerClient } from "../../../lib/supabase/server";

const MAX_BODY_BYTES = 24 * 1024;
const MAX_NAME_LENGTH = 160;
const MAX_ROOT_LENGTH = 2048;
const MAX_CREDENTIAL_REFERENCE_LENGTH = 512;
const SOURCE_TYPES = new Set(["local_filesystem", "external_drive", "nas", "cloud_storage", "provider_api"]);

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

export async function GET() {
  const user = await getAuthenticatedUser();
  if (!user) return NextResponse.json({ error: "Authentication is required." }, { status: 401 });

  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 });

  const { data, error } = await supabase
    .from("legacy_os_storage_sources")
    .select("id,workspace_id,device_id,name,source_type,provider,root_reference,status,last_sync_at,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: "Unable to load storage sources." }, { status: 500 });
  return NextResponse.json({ sources: data ?? [] }, { headers: { "Cache-Control": "private, no-store" } });
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
  const deviceId = input.device_id == null ? null : typeof input.device_id === "string" ? input.device_id.trim() : "";
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const sourceType = typeof input.source_type === "string" ? input.source_type.trim() : "";
  const provider = input.provider == null ? null : typeof input.provider === "string" ? input.provider.trim() : "";
  const rootReference = input.root_reference == null ? null : typeof input.root_reference === "string" ? input.root_reference.trim() : "";
  const credentialReference = input.credential_reference == null ? null : typeof input.credential_reference === "string" ? input.credential_reference.trim() : "";

  if (!workspaceId || !name || !SOURCE_TYPES.has(sourceType)) return badRequest("workspace_id, name, and a supported source_type are required.");
  if (deviceId !== null && !deviceId) return badRequest("device_id must be a valid identifier when supplied.");
  if (name.length > MAX_NAME_LENGTH || (rootReference?.length ?? 0) > MAX_ROOT_LENGTH || (credentialReference?.length ?? 0) > MAX_CREDENTIAL_REFERENCE_LENGTH) {
    return badRequest("Storage source metadata exceeds the allowed length.");
  }
  if (credentialReference && /(password|secret|token|api[_-]?key|private[_-]?key)\s*[:=]/i.test(credentialReference)) {
    return badRequest("Raw credentials must not be submitted as a credential reference.");
  }

  const supabase = await getSupabaseServerClient();
  if (!supabase) return NextResponse.json({ error: "Authentication service is unavailable." }, { status: 503 });

  const { data, error } = await supabase
    .from("legacy_os_storage_sources")
    .insert({
      workspace_id: workspaceId,
      device_id: deviceId,
      created_by: user.id,
      name,
      source_type: sourceType,
      provider: provider || null,
      root_reference: rootReference || null,
      credential_reference: credentialReference || null,
      status: "pending",
    })
    .select("id,workspace_id,device_id,name,source_type,provider,root_reference,status,last_sync_at,created_at,updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: "Unable to register storage source." }, { status: error.code === "42501" ? 403 : 500 });
  }

  return NextResponse.json({ source: data }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
}
