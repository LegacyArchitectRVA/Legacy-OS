import { NextResponse } from "next/server";
import { getAuthenticatedUser, getSupabaseServerClient } from "../../../../../../lib/supabase/server";

const MAX_BODY_BYTES = 256 * 1024;
const MAX_FILES_PER_BATCH = 500;
const MAX_TEXT_LENGTH = 8192;
const MAX_METADATA_BYTES = 16 * 1024;
const SHA256 = /^[a-f0-9]{64}$/i;

const SYNC_SELECT = "id,workspace_id,storage_source_id,status,started_at,completed_at,discovered_count,indexed_count,failed_count,error_code,created_at";

type RouteContext = { params: Promise<{ id: string }> };

type ManifestFile = {
  external_id: string;
  path?: string | null;
  name: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  content_hash?: string | null;
  modified_at?: string | null;
  metadata?: Record<string, unknown>;
};

function response(body: unknown, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "private, no-store" },
  });
}

function badRequest(message: string) {
  return response({ error: message }, 400);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function validOptionalText(value: unknown, max: number): string | null | undefined {
  if (value === undefined || value === null) return value as null | undefined;
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length <= max ? trimmed : undefined;
}

function normalizeFile(value: unknown): ManifestFile | null {
  if (!isRecord(value)) return null;
  const externalId = typeof value.external_id === "string" ? value.external_id.trim() : "";
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const path = validOptionalText(value.path, MAX_TEXT_LENGTH);
  const mimeType = validOptionalText(value.mime_type, 255);
  const contentHash = validOptionalText(value.content_hash, 64);
  const modifiedAt = validOptionalText(value.modified_at, 64);
  const rawSize = value.size_bytes;
  const metadata = value.metadata;

  if (!externalId || externalId.length > 2048 || !name || name.length > 512) return null;
  if (path === undefined || mimeType === undefined || contentHash === undefined || modifiedAt === undefined) return null;
  if (contentHash !== null && !SHA256.test(contentHash)) return null;
  if (rawSize !== undefined && rawSize !== null && (typeof rawSize !== "number" || !Number.isSafeInteger(rawSize) || rawSize < 0)) return null;
  if (metadata !== undefined && !isRecord(metadata)) return null;
  if (metadata && Buffer.byteLength(JSON.stringify(metadata), "utf8") > MAX_METADATA_BYTES) return null;

  return {
    external_id: externalId,
    path,
    name,
    mime_type: mimeType,
    size_bytes: rawSize === undefined ? null : rawSize,
    content_hash: contentHash,
    modified_at: modifiedAt,
    metadata: metadata ?? {},
  };
}

export async function POST(request: Request, { params }: RouteContext) {
  const user = await getAuthenticatedUser();
  if (!user) return response({ error: "Authentication is required." }, 401);

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) return badRequest("Manifest payload is too large.");

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body.");
  }
  if (!isRecord(body)) return badRequest("Invalid manifest body.");

  const { id } = await params;
  const sourceId = id.trim();
  const syncRunId = typeof body.sync_run_id === "string" ? body.sync_run_id.trim() : "";
  const complete = body.complete === true;
  const rawFiles = body.files;

  if (!sourceId || !syncRunId || !Array.isArray(rawFiles)) return badRequest("source id, sync_run_id, and files are required.");
  if (rawFiles.length > MAX_FILES_PER_BATCH) return badRequest("Too many files in one manifest batch.");

  const files = rawFiles.map(normalizeFile);
  if (files.some((file) => file === null)) return badRequest("One or more file records are invalid.");
  const normalizedFiles = files as ManifestFile[];

  const supabase = await getSupabaseServerClient();
  if (!supabase) return response({ error: "Authentication service is unavailable." }, 503);

  const { data: source, error: sourceError } = await supabase
    .from("legacy_os_storage_sources")
    .select("id,workspace_id,status,device_id")
    .eq("id", sourceId)
    .maybeSingle();

  if (sourceError) return response({ error: "Unable to resolve the storage source." }, 500);
  if (!source) return response({ error: "Storage source not found." }, 404);
  if (source.status !== "active") return response({ error: "Storage source is not active." }, 409);

  if (source.device_id) {
    const { data: device, error: deviceError } = await supabase
      .from("legacy_os_devices")
      .select("id,status")
      .eq("id", source.device_id)
      .eq("workspace_id", source.workspace_id)
      .maybeSingle();
    if (deviceError) return response({ error: "Unable to verify the source device." }, 500);
    if (!device || device.status !== "active") return response({ error: "The source device is not active." }, 409);
  }

  const { data: syncRun, error: syncError } = await supabase
    .from("legacy_os_sync_runs")
    .select(SYNC_SELECT)
    .eq("id", syncRunId)
    .eq("storage_source_id", sourceId)
    .eq("workspace_id", source.workspace_id)
    .maybeSingle();

  if (syncError) return response({ error: "Unable to resolve the synchronization run." }, 500);
  if (!syncRun) return response({ error: "Synchronization run not found." }, 404);
  if (!["queued", "running"].includes(syncRun.status)) return response({ error: "Synchronization run is no longer writable." }, 409);

  const { error: runningError } = await supabase
    .from("legacy_os_sync_runs")
    .update({ status: "running", started_at: syncRun.started_at ?? new Date().toISOString() })
    .eq("id", syncRunId)
    .eq("status", "queued");
  if (runningError) return response({ error: "Unable to start synchronization." }, 500);

  if (normalizedFiles.length > 0) {
    const rows = normalizedFiles.map((file) => ({
      workspace_id: source.workspace_id,
      storage_source_id: sourceId,
      external_id: file.external_id,
      path: file.path,
      name: file.name,
      mime_type: file.mime_type,
      size_bytes: file.size_bytes,
      content_hash: file.content_hash,
      modified_at: file.modified_at,
      metadata: file.metadata,
      indexed_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from("legacy_os_files")
      .upsert(rows, { onConflict: "storage_source_id,external_id" });

    if (upsertError) {
      await supabase
        .from("legacy_os_sync_runs")
        .update({ status: "failed", completed_at: new Date().toISOString(), error_code: "FILE_INDEX_FAILED" })
        .eq("id", syncRunId);
      return response({ error: "Unable to index the manifest batch." }, upsertError.code === "42501" ? 403 : 500);
    }
  }

  const discoveredCount = syncRun.discovered_count + normalizedFiles.length;
  const indexedCount = syncRun.indexed_count + normalizedFiles.length;
  const nextStatus = complete ? "completed" : "running";
  const { data: updatedRun, error: updateError } = await supabase
    .from("legacy_os_sync_runs")
    .update({
      status: nextStatus,
      discovered_count: discoveredCount,
      indexed_count: indexedCount,
      ...(complete ? { completed_at: new Date().toISOString() } : {}),
    })
    .eq("id", syncRunId)
    .select(SYNC_SELECT)
    .single();

  if (updateError) return response({ error: "Unable to update synchronization status." }, 500);

  if (complete) {
    const { error: sourceUpdateError } = await supabase
      .from("legacy_os_storage_sources")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("id", sourceId);
    if (sourceUpdateError) return response({ error: "Synchronization completed but source status could not be updated." }, 500);
  }

  return response({ syncRun: updatedRun, indexed: normalizedFiles.length });
}
