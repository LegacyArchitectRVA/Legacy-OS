import { describe, expect, it } from 'vitest';
import { DeviceSourceManager, type DeviceAdapter, type DeviceDescriptor } from './device-source';
import type { SourceConnector } from './source';
import { DeviceAccessController } from '../security/device-access';

const connector: SourceConnector = {
  id: 'device-1', kind: 'filesystem', displayName: 'Test',
  async *scan() { yield { id: 'item', sourceId: 'device-1', path: '/safe/item', name: 'item', type: 'file' }; },
  async health() { return { ok: true }; },
};

const adapter: DeviceAdapter = {
  async discover(): Promise<DeviceDescriptor[]> {
    return [
      { id: 'device-1', name: 'Authorized', platform: 'linux', roots: ['/safe'] },
      { id: 'device-2', name: 'Denied', platform: 'linux', roots: ['/private'] },
    ];
  },
  connector() { return connector; },
};

describe('DeviceSourceManager authorization enforcement', () => {
  const access = new DeviceAccessController([
    { deviceId: 'device-1', allowedRoots: ['/safe'], allowRead: true },
  ]);

  it('filters unauthorized devices during discovery', async () => {
    const manager = new DeviceSourceManager(adapter, access);
    const devices = await manager.discover();
    expect(devices.map((device) => device.id)).toEqual(['device-1']);
  });

  it('never passes an unauthorized root to the connector', async () => {
    const manager = new DeviceSourceManager(adapter, access);
    const authorized = (await manager.discover())[0];
    const items: unknown[] = [];
    for await (const item of manager.scanDevice(authorized)) items.push(item);
    expect(items).toHaveLength(1);
  });

  it('rejects a manually supplied unauthorized device before connector creation', async () => {
    const manager = new DeviceSourceManager(adapter, access);
    const denied: DeviceDescriptor = { id: 'device-2', name: 'Denied', platform: 'linux', roots: ['/private'] };
    await expect(async () => {
      for await (const item of manager.scanDevice(denied)) void item;
    }).rejects.toThrow('Device access denied');
  });
});
