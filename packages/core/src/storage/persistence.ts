export interface StoredRecord {
  id: string;
  collection: string;
  createdAt: string;
  updatedAt: string;
  payload: Record<string, unknown>;
}

export interface PersistenceAdapter {
  save(record: StoredRecord): Promise<void>;
  get(id: string): Promise<StoredRecord | null>;
  query(collection: string, filter?: Record<string, unknown>): Promise<StoredRecord[]>;
  remove(id: string): Promise<boolean>;
}

export class MemoryPersistenceAdapter implements PersistenceAdapter {
  private records = new Map<string, StoredRecord>();

  async save(record: StoredRecord): Promise<void> {
    this.records.set(record.id, record);
  }

  async get(id: string): Promise<StoredRecord | null> {
    return this.records.get(id) ?? null;
  }

  async query(collection: string): Promise<StoredRecord[]> {
    return [...this.records.values()].filter((record) => record.collection === collection);
  }

  async remove(id: string): Promise<boolean> {
    return this.records.delete(id);
  }
}
