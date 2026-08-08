import type { SourceConnector, SourceItem, SourceScanOptions } from './source';
import type { DeviceAccessController } from '../security/device-access';

export type DeviceDescriptor = {
  id: string;
  name: string;
  platform: 'windows' | 'macos' | 'linux' | 'android' | 'ios' | 'nas' | 'unknown';
  roots: string[];
};

export interface DeviceAdapter {
  discover(): Promise<DeviceDescriptor[]>;
  connector(device: DeviceDescriptor, root: string): SourceConnector;
}

export class DeviceSourceManager {
  constructor(
    private readonly adapter: DeviceAdapter,
    private readonly access: DeviceAccessController,
  ) {}

  async discover(): Promise<DeviceDescriptor[]> {
    const devices = await this.adapter.discover();
    return devices.flatMap((device) => {
      try {
        return [this.access.authorize(device)];
      } catch {
        return [];
      }
    });
  }

  async *scanDevice(device: DeviceDescriptor, options?: SourceScanOptions): AsyncIterable<SourceItem> {
    const authorized = this.access.authorize(device);
    for (const root of authorized.roots) {
      this.access.canRead(authorized.id, root) || (() => { throw new Error(`Root access denied: ${root}`); })();
      const connector = this.adapter.connector(authorized, root);
      for await (const item of connector.scan(options)) yield item;
    }
  }
}
