import { describe, expect, it } from 'vitest';
import { DeviceAccessController } from './device-access';

describe('DeviceAccessController policy boundaries', () => {
  it('does not treat a sibling root as authorized', () => {
    const access = new DeviceAccessController([
      { deviceId: 'd1', roots: ['/Users/craig/Documents'], modes: ['read'] },
    ]);
    expect(() => access.assertAuthorized('d1', '/Users/craig/Documents-private')).toThrow();
  });

  it('requires an explicit write grant', () => {
    const access = new DeviceAccessController([
      { deviceId: 'd1', roots: ['/safe'], modes: ['read'] },
    ]);
    expect(access.canRead('d1', '/safe/a')).toBe(true);
    expect(() => access.assertAuthorized('d1', '/safe/a', 'write')).toThrow();
  });
});
