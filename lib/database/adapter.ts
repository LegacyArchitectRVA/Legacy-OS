export interface DatabaseAdapter {
  save<T>(collection: string, data: T): Promise<T>;
  find<T>(collection: string, query?: Record<string, unknown>): Promise<T[]>;
}

export const database: DatabaseAdapter = {
  async save<T>(_collection, data) {
    return data;
  },
  async find<T>(_collection, _query = {}) {
    return [] as T[];
  },
};
