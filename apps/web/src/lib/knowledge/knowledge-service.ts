export type KnowledgeItem = {
  id: string;
  title: string;
  category: string;
  source?: string;
};

export function rankKnowledge(items: KnowledgeItem[], query: string) {
  const normalized = query.toLowerCase();
  return items.filter((item) =>
    item.title.toLowerCase().includes(normalized) ||
    item.category.toLowerCase().includes(normalized)
  );
}
