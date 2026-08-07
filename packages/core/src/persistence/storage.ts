export type StoredRecord<T = unknown> = {
  id: string;
  value: T;
  createdAt: string;
  updatedAt: string;
  version?: number;
  sourceId?: string;
  sourcePath?: string;
  contentHash?: string;
};

export type StoredVersion<T = unknown> = StoredRecord<T> & {
  version: number;
};

export interface StorageAdapter<T = unknown> {
  save(record: StoredRecord<T>): StoredRecord<T>;
  get(id: string): StoredRecord<T> | undefined;
  remove(id: string): boolean;
  list(): StoredRecord<T>[];
  history(id: string): StoredVersion<T>[];
}

export class MemoryStorage<T = unknown> implements StorageAdapter<T> {
  private readonly records = new Map<string, StoredRecord<T>>();
  private readonly versions = new Map<string, StoredVersion<T>[]>();

  save(record: StoredRecord<T>): StoredRecord<T> {
    const previous = this.records.get(record.id);
    const version = (previous?.version ?? 0) + 1;
    const stored: StoredVersion<T> = {
      ...record,
      version,
      createdAt: previous?.createdAt ?? record.createdAt,
      updatedAt: record.updatedAt,
    };

    this.records.set(record.id, stored);
    const history = this.versions.get(record.id) ?? [];
    history.push(stored);
    this.versions.set(record.id, history);

    return stored;
  }

  get(id: string): StoredRecord<T> | undefined {
    return this.records.get(id);
  }

  remove(id: string): boolean {
    return this.records.delete(id);
  }

  list(): StoredRecord<T>[] {
    return Array.from(this.records.values());
  }

  history(id: string): StoredVersion<T>[] {
    return [...(this.versions.get(id) ?? [])];
  }
}
