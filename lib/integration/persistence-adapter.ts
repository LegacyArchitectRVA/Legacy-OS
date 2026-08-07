export interface PersistenceAdapter {
  save<T>(collection: string, item: T): Promise<T>;
  find<T>(collection: string, id: string): Promise<T | null>;
}

export class MemoryPersistenceAdapter implements PersistenceAdapter {
  private store = new Map<string, unknown>();

  async save<T>(collection: string, item: T): Promise<T> {
    this.store.set(collection, item);
    return item;
  }

  async find<T>(collection: string): Promise<T | null> {
    return (this.store.get(collection) as T) ?? null;
  }
}
