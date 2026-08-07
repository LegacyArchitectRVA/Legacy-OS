import type { SourceConnector, SourceItem, SourceScanOptions } from './source';

export type DeviceDescriptor = {
  id: string;
  name: string;
  platform: 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'nas' | 'unknown';
  roots: string[];
};

/**
 * Describes a discovered device without granting the core process implicit
 * access. A platform adapter supplies the actual filesystem connectors.
 */
export interface DeviceAdapter {
  discover(): Promise<DeviceDescriptor[]>;
  connector(device: DeviceDescriptor, root: string): SourceConnector;
}

export class DeviceSourceManager {
  constructor(private readonly adapter: DeviceAdapter) {}

  async discover(): Promise<DeviceDescriptor[]> {
    return this.adapter.discover();
  }

  async *scanDevice(device: DeviceDescriptor, options?: SourceScanOptions): AsyncIterable<SourceItem> {
    for (const root of device.roots) {
      const connector = this.adapter.connector(device, root);
      for await (const item of connector.scan(options)) yield item;
    }
  }
}
