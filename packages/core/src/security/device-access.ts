import type { DeviceDescriptor } from '../connectors/device-source';

export type AuthorizedDevice = {
  deviceId: string;
  allowedRoots: string[];
  allowRead: boolean;
};

export class DeviceAccessController {
  constructor(private readonly grants: AuthorizedDevice[]) {}

  authorize(device: DeviceDescriptor): DeviceDescriptor {
    const grant = this.grants.find((item) => item.deviceId === device.id);
    if (!grant?.allowRead) throw new Error(`Device access denied: ${device.id}`);

    const roots = device.roots.filter((root) => grant.allowedRoots.some((allowed) => isWithinRoot(allowed, root)));
    if (roots.length === 0) throw new Error(`No authorized roots for device: ${device.id}`);

    return { ...device, roots };
  }

  canRead(deviceId: string, root: string): boolean {
    const grant = this.grants.find((item) => item.deviceId === deviceId);
    return !!grant?.allowRead && grant.allowedRoots.some((allowed) => isWithinRoot(allowed, root));
  }
}

function isWithinRoot(root: string, target: string): boolean {
  const normalizedRoot = normalize(root);
  const normalizedTarget = normalize(target);
  return normalizedTarget === normalizedRoot || normalizedTarget.startsWith(`${normalizedRoot}/`);
}

function normalize(path: string): string {
  return path.replace(/\\/g, '/').replace(/\/+$/, '') || '/';
}
