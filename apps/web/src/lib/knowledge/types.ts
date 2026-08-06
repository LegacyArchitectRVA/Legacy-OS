export type KnowledgeCategory =
  | "sop"
  | "procedure"
  | "vendor"
  | "client"
  | "emergency"
  | "policy";

export interface KnowledgeItem {
  id: string;
  organizationId: string;
  title: string;
  category: KnowledgeCategory;
  source: string;
  version: number;
  approved: boolean;
}
