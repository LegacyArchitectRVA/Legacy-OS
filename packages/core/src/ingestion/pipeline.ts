import type { IndexedItem } from "../indexing/indexer";
import { LegacyIndexer } from "../indexing/indexer";

export type IngestionRecord = {
  id: string;
  sourceId: string;
  name: string;
  type: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export class IngestionPipeline {
  constructor(private readonly indexer: LegacyIndexer) {}

  ingest(record: IngestionRecord): IndexedItem {
    const now = new Date().toISOString();

    return this.indexer.add({
      id: record.id,
      sourceId: record.sourceId,
      name: record.name,
      type: record.type,
      metadata: record.metadata ?? {},
      createdAt: record.createdAt ?? now,
      updatedAt: record.updatedAt ?? now,
    });
  }

  ingestMany(records: IngestionRecord[]): IndexedItem[] {
    return records.map((record) => this.ingest(record));
  }
}
