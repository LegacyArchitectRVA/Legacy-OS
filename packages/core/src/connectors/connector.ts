export type ConnectorType =
  | 'local_filesystem'
  | 'external_drive'
  | 'cloud_storage'
  | 'social_platform';

export interface SourceConnection {
  id: string;
  type: ConnectorType;
  name: string;
  enabled: boolean;
  lastSyncAt?: string;
}

export interface IndexedSourceItem {
  id: string;
  sourceId: string;
  path?: string;
  name: string;
  mimeType?: string;
  size?: number;
  createdAt?: string;
  modifiedAt?: string;
  checksum?: string;
}

export interface Connector {
  connect(): Promise<SourceConnection>;
  scan(): Promise<IndexedSourceItem[]>;
  sync(): Promise<{added: number; updated: number; removed: number}>;
  disconnect(): Promise<void>;
}
