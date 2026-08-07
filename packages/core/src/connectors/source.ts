export type SourceKind = 'filesystem' | 'cloud' | 'device' | 'api';

export type SourceItem = {
  id: string;
  sourceId: string;
  path: string;
  name: string;
  type: string;
  size?: number;
  modifiedAt?: string;
  contentHash?: string;
  metadata?: Record<string, unknown>;
};

export type SourceScanOptions = {
  recursive?: boolean;
  includeHidden?: boolean;
  modifiedAfter?: string;
  modifiedBefore?: string;
  types?: string[];
};

export interface SourceConnector {
  readonly id: string;
  readonly kind: SourceKind;
  readonly displayName: string;
  scan(options?: SourceScanOptions): AsyncIterable<SourceItem>;
  health(): Promise<{ ok: boolean; message?: string }>;
}

export class ConnectorRegistry {
  private readonly connectors = new Map<string, SourceConnector>();

  register(connector: SourceConnector): void {
    if (this.connectors.has(connector.id)) {
      throw new Error(`Connector already registered: ${connector.id}`);
    }
    this.connectors.set(connector.id, connector);
  }

  get(id: string): SourceConnector | undefined {
    return this.connectors.get(id);
  }

  list(): SourceConnector[] {
    return Array.from(this.connectors.values());
  }

  async health(): Promise<Record<string, { ok: boolean; message?: string }>> {
    const entries = await Promise.all(
      this.list().map(async (connector) => [connector.id, await connector.health()] as const),
    );
    return Object.fromEntries(entries);
  }
}
