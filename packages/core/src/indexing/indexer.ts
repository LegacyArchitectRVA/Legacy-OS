export type IndexedItem = {
  id: string;
  sourceId: string;
  name: string;
  type: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type IndexQuery = {
  text?: string;
  filters?: Record<string, string | string[]>;
  sourceIds?: string[];
  types?: string[];
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  limit?: number;
  offset?: number;
};

export class LegacyIndexer {
  private readonly items = new Map<string, IndexedItem>();

  add(item: IndexedItem): IndexedItem {
    this.items.set(item.id, item);
    return item;
  }

  remove(id: string): boolean {
    return this.items.delete(id);
  }

  get(id: string): IndexedItem | undefined {
    return this.items.get(id);
  }

  count(): number {
    return this.items.size;
  }

  search(query: IndexQuery = {}): IndexedItem[] {
    const text = query.text?.trim().toLowerCase();
    const sourceIds = new Set(query.sourceIds ?? []);
    const types = new Set(query.types ?? []);

    const matches = Array.from(this.items.values()).filter((item) => {
      if (sourceIds.size > 0 && !sourceIds.has(item.sourceId)) return false;
      if (types.size > 0 && !types.has(item.type)) return false;
      if (query.createdAfter && item.createdAt < query.createdAfter) return false;
      if (query.createdBefore && item.createdAt > query.createdBefore) return false;
      if (query.updatedAfter && item.updatedAt < query.updatedAfter) return false;
      if (query.updatedBefore && item.updatedAt > query.updatedBefore) return false;

      if (text) {
        const searchable = JSON.stringify({
          id: item.id,
          sourceId: item.sourceId,
          name: item.name,
          type: item.type,
          metadata: item.metadata,
        }).toLowerCase();
        if (!searchable.includes(text)) return false;
      }

      return Object.entries(query.filters ?? {}).every(([key, value]) => {
        const current = item.metadata[key];
        return Array.isArray(value)
          ? value.includes(String(current))
          : String(current) === value;
      });
    });

    const offset = Math.max(0, query.offset ?? 0);
    const limit = query.limit === undefined ? matches.length : Math.max(0, query.limit);
    return matches.slice(offset, offset + limit);
  }
}
