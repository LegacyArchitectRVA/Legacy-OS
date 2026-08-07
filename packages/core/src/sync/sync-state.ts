export type SyncStatus = "idle" | "scanning" | "syncing" | "completed" | "failed";

export type SyncState = {
  sourceId: string;
  status: SyncStatus;
  lastStartedAt?: string;
  lastCompletedAt?: string;
  cursor?: string;
  itemsProcessed: number;
  error?: string;
};

export class SyncStateManager {
  private states = new Map<string, SyncState>();

  get(sourceId: string): SyncState | undefined {
    return this.states.get(sourceId);
  }

  begin(sourceId: string): SyncState {
    const state: SyncState = {
      sourceId,
      status: "syncing",
      lastStartedAt: new Date().toISOString(),
      itemsProcessed: 0,
    };

    this.states.set(sourceId, state);
    return state;
  }

  complete(sourceId: string, itemsProcessed: number): SyncState | undefined {
    const state = this.states.get(sourceId);
    if (!state) return undefined;

    state.status = "completed";
    state.itemsProcessed = itemsProcessed;
    state.lastCompletedAt = new Date().toISOString();

    return state;
  }
}
