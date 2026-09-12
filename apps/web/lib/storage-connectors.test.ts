import assert from "node:assert/strict";
import test from "node:test";
import { createStorageConnectorRegistry, normalizeManifestBatch, normalizeManifestFile } from "./storage-connectors.ts";

test("normalizes a valid manifest file", () => {
  const file = normalizeManifestFile({
    externalId: "drive-file-1",
    path: "Documents/Family/plan.pdf",
    name: "plan.pdf",
    mimeType: "application/pdf",
    sizeBytes: 1024,
    contentHash: "a".repeat(64),
    modifiedAt: "2026-09-12T12:00:00Z",
    metadata: { provider: "test" },
  });
  assert.equal(file.path, "Documents/Family/plan.pdf");
  assert.equal(file.sizeBytes, 1024);
});

test("rejects traversal and absolute paths", () => {
  for (const path of ["../secret.txt", "Documents/../../secret.txt", "/etc/passwd", "Documents\\secret.txt"]) {
    assert.throws(() => normalizeManifestFile({ externalId: "1", path, name: "secret.txt" }));
  }
});

test("rejects invalid hashes, sizes, dates, and metadata", () => {
  assert.throws(() => normalizeManifestFile({ externalId: "1", path: "a.txt", name: "a.txt", contentHash: "bad" }));
  assert.throws(() => normalizeManifestFile({ externalId: "1", path: "a.txt", name: "a.txt", sizeBytes: -1 }));
  assert.throws(() => normalizeManifestFile({ externalId: "1", path: "a.txt", name: "a.txt", modifiedAt: "not-a-date" }));
  assert.throws(() => normalizeManifestFile({ externalId: "1", path: "a.txt", name: "a.txt", metadata: [] }));
});

test("enforces the manifest batch boundary", () => {
  assert.throws(() => normalizeManifestBatch({ files: Array.from({ length: 501 }, () => ({ externalId: "1", path: "a.txt", name: "a.txt" })), complete: false, nextCursor: null }));
  const batch = normalizeManifestBatch({ files: [{ externalId: "1", path: "a.txt", name: "a.txt" }], complete: true, nextCursor: "cursor-1" });
  assert.equal(batch.complete, true);
  assert.equal(batch.nextCursor, "cursor-1");
});

test("prevents duplicate connector registration", () => {
  const connector = { sourceType: "cloud_storage" as const, enumerate: async () => ({ files: [], complete: true, nextCursor: null }) };
  assert.throws(() => createStorageConnectorRegistry([connector, connector]));
});
