import { describe, expect, it } from 'vitest';
import { DeviceAccessController } from './device-access';

describe('DeviceAccessController policy boundaries', () => {
  it('does not treat a sibling root as authorized', () => {
    const access = new DeviceAccessController([
      { deviceId: 'd1', allowedRoots: ['/Users/craig/Documents'], allowRead: true },
    ]);
    expect(access.canRead('d1', '/Users/craig/Documents-private')).toBe(false);
  });

  it('requires an explicit read grant', () => {
    const access = new DeviceAccessController([
      { deviceId: 'd1', allowedRoots: ['/safe'], allowRead: false },
    ]);
    expect(access.canRead('d1', '/safe/a')).toBe(false);
  });
});
