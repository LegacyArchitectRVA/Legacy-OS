export type DatabaseClientConfig = {
  organizationId: string;
};

export function createDatabaseContext(config: DatabaseClientConfig) {
  return {
    organizationId: config.organizationId,
    ready: true,
  };
}
