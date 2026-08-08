import { describe, expect, it } from 'vitest';
import { DeviceAccessController } from './device-access';

describe('DeviceAccessController', () => {
  const device = {
    id: 'device-1', name: 'Laptop', platform: 'linux' as const,
    roots: ['/home/user/Documents', '/home/user/Private'],
  };

  it('exposes only explicitly authorized roots', () => {
    const access = new DeviceAccessController([
      { deviceId: 'device-1', allowedRoots: ['/home/user/Documents'], allowRead: true },
    ]);
    expect(access.authorize(device).roots).toEqual(['/home/user/Documents']);
  });

  it('denies an unauthorized device', () => {
    const access = new DeviceAccessController([]);
    expect(() => access.authorize(device)).toThrow('Device access denied');
  });

  it('denies a sibling-prefix root', () => {
    const access = new DeviceAccessController([
      { deviceId: 'device-1', allowedRoots: ['/home/user/Documents'], allowRead: true },
    ]);
    expect(access.canRead('device-1', '/home/user/Documents-private')).toBe(false);
  });
});
