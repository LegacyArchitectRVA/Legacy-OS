import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSupabaseServerClient } from "../../../../../lib/supabase/server";

const SYNC_SELECT = "id,workspace_id,storage_source_id,status,started_at,completed_at,discovered_count,indexed_count,failed_count,error_code,created_at";

type RouteContext = { params: Promise<{ id: string }> };

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(_request: Request, { params }: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Authentication is required.", 401);

  const { id } = await params;
  const sourceId = id.trim();
  if (!sourceId) return errorResponse("Storage source is required.", 400);

  const supabase = await getSupabaseServerClient();
  if (!supabase) return errorResponse("Authentication service is unavailable.", 503);

  const { data: source, error: sourceError } = await supabase
    .from("legacy_os_storage_sources")
    .select("id,workspace_id,status,device_id")
    .eq("id", sourceId)
    .maybeSingle();

  if (sourceError) return errorResponse("Unable to resolve the storage source.", 500);
  if (!source) return errorResponse("Storage source not found.", 404);
  if (source.status !== "active") return errorResponse("Storage source is not active.", 409);

  if (source.device_id) {
    const { data: device, error: deviceError } = await supabase
      .from("legacy_os_devices")
      .select("id,status")
      .eq("id", source.device_id)
      .eq("workspace_id", source.workspace_id)
      .maybeSingle();
    if (deviceError) return errorResponse("Unable to verify the source device.", 500);
    if (!device || device.status !== "active") return errorResponse("The source device is not active.", 409);
  }

  const { data: existing, error: existingError } = await supabase
    .from("legacy_os_sync_runs")
    .select(SYNC_SELECT)
    .eq("storage_source_id", sourceId)
    .in("status", ["queued", "running"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingError) return errorResponse("Unable to inspect current synchronization status.", 500);
  if (existing) return NextResponse.json({ syncRun: existing, reused: true }, { status: 200, headers: { "Cache-Control": "private, no-store" } });

  const { data: syncRun, error: insertError } = await supabase
    .from("legacy_os_sync_runs")
    .insert({ workspace_id: source.workspace_id, storage_source_id: sourceId, status: "queued" })
    .select(SYNC_SELECT)
    .single();

  if (insertError) {
    if (insertError.code === "23505") {
      const { data: concurrentRun } = await supabase
        .from("legacy_os_sync_runs")
        .select(SYNC_SELECT)
        .eq("storage_source_id", sourceId)
        .in("status", ["queued", "running"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (concurrentRun) return NextResponse.json({ syncRun: concurrentRun, reused: true }, { status: 200, headers: { "Cache-Control": "private, no-store" } });
    }
    return errorResponse(insertError.code === "42501" ? "You are not authorized to synchronize this source." : "Unable to queue synchronization.", insertError.code === "42501" ? 403 : 500);
  }

  return NextResponse.json({ syncRun, reused: false }, { status: 202, headers: { "Cache-Control": "private, no-store" } });
}

export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) return errorResponse("Authentication is required.", 401);

  const { id } = await params;
  const sourceId = id.trim();
  if (!sourceId) return errorResponse("Storage source is required.", 400);

  const supabase = await getSupabaseServerClient();
  if (!supabase) return errorResponse("Authentication service is unavailable.", 503);

  const { data: runs, error } = await supabase
    .from("legacy_os_sync_runs")
    .select(SYNC_SELECT)
    .eq("storage_source_id", sourceId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) return errorResponse("Unable to load synchronization history.", 500);
  return NextResponse.json({ syncRuns: runs ?? [] }, { headers: { "Cache-Control": "private, no-store" } });
}
