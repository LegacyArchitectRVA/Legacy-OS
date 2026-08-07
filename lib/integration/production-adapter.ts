export interface ProductionAdapterStatus {
  database: boolean;
  storage: boolean;
  ai: boolean;
  authentication: boolean;
}

export function getProductionStatus(): ProductionAdapterStatus {
  return {
    database: false,
    storage: false,
    ai: false,
    authentication: false,
  };
}
