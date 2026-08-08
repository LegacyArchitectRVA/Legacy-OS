import { describe, expect, it } from 'vitest';
import { mkdtemp, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FilesystemConnector } from './filesystem';
import { SourceAccessController } from '../security/source-access';

describe('FilesystemConnector security', () => {
  it('rejects a root that is not explicitly authorized', async () => {
    const root = await mkdtemp(join(tmpdir(), 'legacy-os-sec-'));
    try {
      const access = new SourceAccessController([]);
      const connector = new FilesystemConnector('device-1', root, access);
      const items: unknown[] = [];
      await expect(async () => {
        for await (const item of connector.scan()) items.push(item);
      }).rejects.toThrow('Source access denied');
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('does not follow a symlink outside the authorized root', async () => {
    const root = await mkdtemp(join(tmpdir(), 'legacy-os-sec-root-'));
    const outside = await mkdtemp(join(tmpdir(), 'legacy-os-sec-outside-'));
    try {
      await writeFile(join(outside, 'secret.txt'), 'secret');
      await symlink(outside, join(root, 'outside-link'), 'dir');
      const access = new SourceAccessController([
        { sourceId: 'device-1', roots: [root], modes: ['read'] },
      ]);
      const connector = new FilesystemConnector('device-1', root, access);
      const items: unknown[] = [];
      await expect(async () => {
        for await (const item of connector.scan()) items.push(item);
      }).rejects.toThrow('Path access denied');
      expect(items).toHaveLength(0);
    } finally {
      await rm(root, { recursive: true, force: true });
      await rm(outside, { recursive: true, force: true });
    }
  });
});
