export type StoredRecord<T = unknown> = {
  id: string;
  value: T;
  createdAt: string;
  updatedAt: string;
};

export interface StorageAdapter<T = unknown> {
  save(record: StoredRecord<T>): StoredRecord<T>;
  get(id: string): StoredRecord<T> | undefined;
  remove(id: string): boolean;
  list(): StoredRecord<T>[];
}

export class MemoryStorage<T = unknown> implements StorageAdapter<T> {
  private records = new Map<string, StoredRecord<T>>();

  save(record: StoredRecord<T>): StoredRecord<T> {
    this.records.set(record.id, record);
    return record;
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
}
