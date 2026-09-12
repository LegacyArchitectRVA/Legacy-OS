import assert from "node:assert/strict";
import { runStorageSync } from "./storage-sync-orchestrator.ts";
import type { StorageSyncOrchestratorDependencies } from "./storage-sync-orchestrator.ts";
import type { ManifestBatch, StorageConnector } from "./storage-connectors.ts";

type Row = Record<string, unknown>;

function createFakeSupabase(source: Row, device: Row | null) {
  const calls: Array<{ name: string; args: Record<string, unknown> }> = [];
  const updates: Array<{ values: Record<string, unknown>; id: string }> = [];
  const runs = [
    { id: "run-1", workspace_id: "workspace-1", storage_source_id: "source-1", status: "running" as const },
  ];

  const client = {
    from(table: string) {
      const filters: Record<string, string> = {};
      const query = {
        select(columns: string) {
          void columns;
          return query;
        },
        eq(column: string, value: string) { filters[column] = value; return query; },
        async maybeSingle() {
          if (table === "legacy_os_storage_sources") return { data: filters.id === source.id ? source : null, error: null };
          if (table === "legacy_os_devices") return { data: filters.id === device?.id && filters.workspace_id === "workspace-1" ? device : null, error: null };
          return { data: null, error: null };
        },
        update(values: Record<string, unknown>) {
          return {
            eq(column: string, value: string) {
              updates.push({ values, id: column === "id" ? value : "" });
              return { data: null, error: null };
            },
          };
        },
      };
      return query;
    },
    async rpc(name: string, args: Record<string, unknown>) {
      calls.push({ name, args });
      const complete = args.p_complete === true;
      return {
        data: { ...runs[0], status: complete ? "completed" : "running" },
        error: null,
      };
    },
  };

  return { client, calls, updates };
}

const source = {
  id: "source-1",
  workspace_id: "workspace-1",
  device_id: "device-1",
  source_type: "local_filesystem" as const,
  status: "active" as const,
};
const device = { id: "device-1", status: "active" as const };

let enumerationCount = 0;
const connector: StorageConnector = {
  sourceType: "local_filesystem",
  async enumerate(_context, cursor): Promise<ManifestBatch> {
    enumerationCount += 1;
    if (!cursor) {
      return {
        files: [{
          externalId: "file-1",
          path: "docs/file.txt",
          name: "file.txt",
          mimeType: "text/plain",
          sizeBytes: 12,
          contentHash: null,
          modifiedAt: null,
          metadata: {},
        }],
        complete: false,
        nextCursor: "page-2",
      };
    }
    return {
      files: [{
        externalId: "file-2",
        path: "docs/second.txt",
        name: "second.txt",
        mimeType: "text/plain",
        sizeBytes: 14,
        contentHash: null,
        modifiedAt: null,
        metadata: {},
      }],
      complete: true,
      nextCursor: null,
    };
  },
};

function deps(fake: ReturnType<typeof createFakeSupabase>, getConnector: StorageSyncOrchestratorDependencies["getConnector"]): StorageSyncOrchestratorDependencies {
  return { supabase: fake.client as unknown as StorageSyncOrchestratorDependencies["supabase"], getConnector };
}

const fake = createFakeSupabase(source, device);
const result = await runStorageSync(
  { id: "run-1", workspace_id: "workspace-1", storage_source_id: "source-1" },
  deps(fake, () => connector),
);

assert.equal(result.batches, 2);
assert.equal(result.files, 2);
assert.equal(result.syncRun.status, "completed");
assert.equal(enumerationCount, 2);
assert.equal(fake.calls.length, 2);
assert.equal(fake.calls[0]?.args.p_complete, false);
assert.equal(fake.calls[1]?.args.p_complete, true);

const failingFake = createFakeSupabase(source, device);
await assert.rejects(
  runStorageSync(
    { id: "run-1", workspace_id: "workspace-1", storage_source_id: "source-1" },
    deps(failingFake, () => ({
      sourceType: "local_filesystem",
      async enumerate(): Promise<ManifestBatch> {
        throw new Error("connector failure");
      },
    })),
  ),
  /connector failure/,
);
assert.equal(failingFake.updates.length, 1);
assert.equal(failingFake.updates[0]?.id, "run-1");
assert.equal(failingFake.updates[0]?.values.status, "failed");
assert.equal(failingFake.updates[0]?.values.error_code, "SYNC_EXECUTION_FAILED");

const revokedFake = createFakeSupabase({ ...source, status: "revoked" }, device);
await assert.rejects(
  runStorageSync(
    { id: "run-1", workspace_id: "workspace-1", storage_source_id: "source-1" },
    deps(revokedFake, () => connector),
  ),
  /no longer active/,
);
assert.equal(revokedFake.calls.length, 0);

console.log("storage-sync-orchestrator tests passed");
