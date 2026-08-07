export type KnowledgeItem = {
  id: string;
  title: string;
  category: string;
};

export function KnowledgeVault({ items }: { items: KnowledgeItem[] }) {
  return {
    title: 'Knowledge Vault',
    items,
    capabilities: [
      'Document storage',
      'SOP organization',
      'Business memory preparation'
    ]
  };
}
