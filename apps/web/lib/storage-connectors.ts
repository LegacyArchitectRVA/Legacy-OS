export type StorageSourceType =
  | "local_filesystem"
  | "external_drive"
  | "nas"
  | "cloud_storage"
  | "provider_api";

export type StorageConnectorContext = {
  workspaceId: string;
  sourceId: string;
  deviceId: string | null;
  syncRunId: string;
  signal?: AbortSignal;
};

export type ManifestFile = {
  externalId: string;
  path: string;
  name: string;
  mimeType: string | null;
  sizeBytes: number | null;
  contentHash: string | null;
  modifiedAt: string | null;
  metadata: Record<string, unknown>;
};

export type ManifestBatch = {
  files: ManifestFile[];
  complete: boolean;
  nextCursor: string | null;
};

export interface StorageConnector {
  readonly sourceType: StorageSourceType;
  enumerate(context: StorageConnectorContext, cursor?: string | null): Promise<ManifestBatch>;
}

const MAX_BATCH_SIZE = 500;
const MAX_STRING_LENGTH = 4096;
const MAX_PATH_LENGTH = 4096;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

function boundedString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.normalize("NFC").trim();
  if (!normalized || normalized.length > maxLength) return null;
  return normalized;
}

export function normalizeManifestFile(input: unknown): ManifestFile {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invalid manifest file.");
  }

  const record = input as Record<string, unknown>;
  const externalId = boundedString(record.externalId, MAX_STRING_LENGTH);
  const path = boundedString(record.path, MAX_PATH_LENGTH);
  const name = boundedString(record.name, MAX_STRING_LENGTH);
  if (!externalId || !path || !name) throw new Error("Manifest file identity is invalid.");
  if (path.includes("\\") || path.startsWith("/") || path.includes("../") || path === ".." || path.includes("/..")) {
    throw new Error("Manifest path is invalid.");
  }

  const sizeBytes = record.sizeBytes === null || record.sizeBytes === undefined ? null : record.sizeBytes;
  if (sizeBytes !== null && (!Number.isSafeInteger(sizeBytes) || sizeBytes < 0)) {
    throw new Error("Manifest file size is invalid.");
  }

  const contentHash = record.contentHash === null || record.contentHash === undefined ? null : boundedString(record.contentHash, 64);
  if (contentHash !== null && !SHA256_PATTERN.test(contentHash)) {
    throw new Error("Manifest content hash is invalid.");
  }

  const modifiedAt = record.modifiedAt === null || record.modifiedAt === undefined ? null : boundedString(record.modifiedAt, 64);
  if (modifiedAt !== null && Number.isNaN(Date.parse(modifiedAt))) {
    throw new Error("Manifest modification time is invalid.");
  }

  const mimeType = record.mimeType === null || record.mimeType === undefined ? null : boundedString(record.mimeType, 255);
  const metadata = record.metadata === undefined ? {} : record.metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    throw new Error("Manifest metadata is invalid.");
  }

  return {
    externalId,
    path,
    name,
    mimeType,
    sizeBytes: sizeBytes as number | null,
    contentHash,
    modifiedAt,
    metadata: metadata as Record<string, unknown>,
  };
}

export function normalizeManifestBatch(input: ManifestBatch): ManifestBatch {
  if (!Array.isArray(input.files) || input.files.length > MAX_BATCH_SIZE) {
    throw new Error("Manifest batch is invalid.");
  }
  const nextCursor = input.nextCursor === null ? null : boundedString(input.nextCursor, MAX_STRING_LENGTH);
  if (input.nextCursor !== null && !nextCursor) throw new Error("Manifest cursor is invalid.");
  return {
    files: input.files.map(normalizeManifestFile),
    complete: input.complete === true,
    nextCursor,
  };
}

export function createStorageConnectorRegistry(connectors: readonly StorageConnector[]) {
  const registry = new Map<StorageSourceType, StorageConnector>();
  for (const connector of connectors) {
    if (registry.has(connector.sourceType)) throw new Error(`Duplicate connector: ${connector.sourceType}`);
    registry.set(connector.sourceType, connector);
  }
  return {
    get(sourceType: StorageSourceType) {
      return registry.get(sourceType) ?? null;
    },
  };
}

export const STORAGE_CONNECTOR_LIMITS = {
  maxBatchSize: MAX_BATCH_SIZE,
  maxPathLength: MAX_PATH_LENGTH,
  maxStringLength: MAX_STRING_LENGTH,
} as const;
