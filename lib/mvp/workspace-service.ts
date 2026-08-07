export type Workspace = {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
};

export function createWorkspace(name: string, ownerId: string): Workspace {
  return {
    id: crypto.randomUUID(),
    name,
    ownerId,
    createdAt: new Date().toISOString(),
  };
}
