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
};

export class LegacyIndexer {
  private items: IndexedItem[] = [];

  add(item: IndexedItem): IndexedItem {
    this.items.push(item);
    return item;
  }

  search(query: IndexQuery): IndexedItem[] {
    const text = query.text?.toLowerCase();

    return this.items.filter((item) => {
      const matchesText = !text ||
        `${item.name} ${item.type}`.toLowerCase().includes(text);

      const matchesFilters = Object.entries(query.filters ?? {}).every(
        ([key, value]) => {
          const current = item.metadata[key];
          return Array.isArray(value)
            ? value.includes(String(current))
            : String(current) === value;
        },
      );

      return matchesText && matchesFilters;
    });
  }
}
