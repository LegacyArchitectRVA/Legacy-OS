export interface StorageAdapter {
  save(key: string, value: unknown): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  remove(key: string): Promise<void>;
}

export class MemoryStorageAdapter implements StorageAdapter {
  private store = new Map<string, unknown>();

  async save(key: string, value: unknown): Promise<void> {
    this.store.set(key, value);
  }

  async get<T>(key: string): Promise<T | null> {
    return (this.store.get(key) as T) ?? null;
  }

  async remove(key: string): Promise<void> {
    this.store.delete(key);
  }
}
