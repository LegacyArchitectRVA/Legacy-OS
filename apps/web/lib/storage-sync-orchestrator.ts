import type { StorageConnector, StorageConnectorContext, StorageSourceType } from "./storage-connectors";
import { normalizeManifestBatch } from "./storage-connectors";

type SyncStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

type StorageSourceRecord = {
  id: string;
  workspace_id: string;
  device_id: string | null;
  source_type: StorageSourceType;
  status: "pending" | "active" | "paused" | "revoked" | "error";
};

type DeviceRecord = {
  id: string;
  status: "pending" | "active" | "revoked";
};

type SyncRunRecord = {
  id: string;
  workspace_id: string;
  storage_source_id: string;
  status: SyncStatus;
};

type QueryResult<T> = { data: T | null; error: { code?: string; message?: string } | null };

type SupabaseLike = {
  from(table: string): {
    select(columns: string): SupabaseLike;
    eq(column: string, value: string): SupabaseLike;
    maybeSingle(): Promise<QueryResult<unknown>>;
    update(values: Record<string, unknown>): SupabaseLike;
  };
  rpc(name: string, args: Record<string, unknown>): Promise<QueryResult<SyncRunRecord>>;
};

export type StorageSyncOrchestratorDependencies = {
  supabase: SupabaseLike;
  getConnector: (sourceType: StorageSourceType) => StorageConnector | null;
  maxBatches?: number;
};

export type StorageSyncResult = {
  syncRun: SyncRunRecord;
  batches: number;
  files: number;
};

const DEFAULT_MAX_BATCHES = 10_000;

function throwSyncError(message: string): never {
  throw new Error(message);
}

async function getSource(supabase: SupabaseLike, sourceId: string): Promise<StorageSourceRecord> {
  const result = await supabase
    .from("legacy_os_storage_sources")
    .select("id,workspace_id,device_id,source_type,status")
    .eq("id", sourceId)
    .maybeSingle();
  if (result.error) throwSyncError("Unable to resolve the storage source.");
  if (!result.data || typeof result.data !== "object") throwSyncError("Storage source not found.");
  return result.data as StorageSourceRecord;
}

async function getDevice(supabase: SupabaseLike, deviceId: string, workspaceId: string): Promise<DeviceRecord> {
  const result = await supabase
    .from("legacy_os_devices")
    .select("id,status")
    .eq("id", deviceId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  if (result.error) throwSyncError("Unable to verify the source device.");
  if (!result.data || typeof result.data !== "object") throwSyncError("Source device not found.");
  return result.data as DeviceRecord;
}

async function assertSourceIsRunnable(
  supabase: SupabaseLike,
  source: StorageSourceRecord,
): Promise<void> {
  if (source.status !== "active") throwSyncError("Storage source is no longer active.");
  if (source.device_id) {
    const device = await getDevice(supabase, source.device_id, source.workspace_id);
    if (device.status !== "active") throwSyncError("The source device is no longer active.");
  }
}

async function failSyncRun(supabase: SupabaseLike, syncRunId: string): Promise<void> {
  await supabase
    .from("legacy_os_sync_runs")
    .update({ status: "failed", error_code: "SYNC_EXECUTION_FAILED" })
    .eq("id", syncRunId);
}

export async function runStorageSync(
  syncRun: Pick<SyncRunRecord, "id" | "workspace_id" | "storage_source_id">,
  dependencies: StorageSyncOrchestratorDependencies,
): Promise<StorageSyncResult> {
  const { supabase, getConnector } = dependencies;
  const maxBatches = dependencies.maxBatches ?? DEFAULT_MAX_BATCHES;
  if (!Number.isSafeInteger(maxBatches) || maxBatches < 1) throwSyncError("Invalid synchronization batch limit.");

  let cursor: string | null = null;
  let batches = 0;
  let files = 0;

  try {
    while (batches < maxBatches) {
      const source = await getSource(supabase, syncRun.storage_source_id);
      if (source.workspace_id !== syncRun.workspace_id) throwSyncError("Synchronization ownership mismatch.");
      await assertSourceIsRunnable(supabase, source);

      const connector = getConnector(source.source_type);
      if (!connector) throwSyncError("No connector is available for this storage source.");

      const context: StorageConnectorContext = {
        workspaceId: syncRun.workspace_id,
        sourceId: syncRun.storage_source_id,
        deviceId: source.device_id,
        syncRunId: syncRun.id,
      };
      const batch = normalizeManifestBatch(await connector.enumerate(context, cursor));
      const rpcResult = await supabase.rpc("ingest_legacy_os_manifest", {
        p_sync_run_id: syncRun.id,
        p_source_id: syncRun.storage_source_id,
        p_files: batch.files,
        p_complete: batch.complete,
      });
      if (rpcResult.error || !rpcResult.data) throwSyncError("Unable to ingest synchronization results.");

      batches += 1;
      files += batch.files.length;
      if (batch.complete) return { syncRun: rpcResult.data, batches, files };
      if (!batch.nextCursor || batch.nextCursor === cursor) {
        throwSyncError("Connector returned an invalid continuation cursor.");
      }
      cursor = batch.nextCursor;
    }

    throwSyncError("Synchronization exceeded the maximum batch limit.");
  } catch (error) {
    await failSyncRun(supabase, syncRun.id);
    throw error;
  }
}
