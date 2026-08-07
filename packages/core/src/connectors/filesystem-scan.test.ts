import { describe, expect, it } from 'vitest';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { FilesystemConnector } from './filesystem';

describe('FilesystemConnector', () => {
  it('discovers files recursively with stable metadata and hashes', async () => {
    const root = await mkdtemp(join(tmpdir(), 'legacy-os-'));
    try {
      await writeFile(join(root, 'July-social.txt'), 'hello legacy');
      const connector = new FilesystemConnector('test-device', root);
      const items = [];
      for await (const item of connector.scan({ recursive: true, types: ['txt'] })) items.push(item);

      expect(items).toHaveLength(1);
      expect(items[0]).toMatchObject({
        sourceId: 'test-device',
        name: 'July-social.txt',
        type: 'txt',
        size: 12,
      });
      expect(items[0].contentHash).toMatch(/^[a-f0-9]{64}$/);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('reports an unavailable root as unhealthy', async () => {
    const connector = new FilesystemConnector('missing', '/path/that/does/not/exist');
    await expect(connector.health()).resolves.toMatchObject({ ok: false });
  });
});
