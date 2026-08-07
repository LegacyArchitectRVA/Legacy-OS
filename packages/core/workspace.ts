export type Workspace = {
  id: string;
  name: string;
  ownerId: string;
};

export type KnowledgeItem = {
  id: string;
  workspaceId: string;
  title: string;
  category: "sop" | "template" | "process" | "document";
};
