import { describe, expect, it } from 'vitest';
import { DeviceSourceManager, type DeviceAdapter } from './device-source';
import type { SourceConnector } from './source';
import { DeviceAccessController } from '../security/device-access';

describe('DeviceSourceManager', () => {
  it('discovers devices and scans each authorized root', async () => {
    const connector: SourceConnector = {
      id: 'device-root', kind: 'filesystem', displayName: 'Root',
      async *scan() {
        yield { id: 'one', sourceId: 'device', path: '/one', name: 'one', type: 'txt' };
      },
      async health() { return { ok: true }; },
    };
    const adapter: DeviceAdapter = {
      async discover() { return [{ id: 'device', name: 'Test', platform: 'linux', roots: ['/authorized'] }]; },
      connector() { return connector; },
    };
    const access = new DeviceAccessController([
      { deviceId: 'device', allowedRoots: ['/authorized'], allowRead: true },
    ]);
    const manager = new DeviceSourceManager(adapter, access);

    expect(await manager.discover()).toHaveLength(1);
    const items = [];
    for await (const item of manager.scanDevice((await manager.discover())[0])) items.push(item);
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('one');
  });
});
