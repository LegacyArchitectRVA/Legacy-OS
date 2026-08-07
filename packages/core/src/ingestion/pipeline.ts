import type { IndexedItem } from '../indexing/indexer';
import type { StorageAdapter } from '../persistence/storage';

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
  constructor(private readonly storage: StorageAdapter<IndexedItem>) {}

  ingest(record: IngestionRecord): IndexedItem {
    const now = new Date().toISOString();

    const item: IndexedItem = {
      id: record.id,
      sourceId: record.sourceId,
      name: record.name,
      type: record.type,
      metadata: record.metadata ?? {},
      createdAt: record.createdAt ?? now,
      updatedAt: record.updatedAt ?? now,
    };

    this.storage.save({
      id: item.id,
      value: item,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });

    return item;
  }

  ingestMany(records: IngestionRecord[]): IndexedItem[] {
    return records.map((record) => this.ingest(record));
  }
}
