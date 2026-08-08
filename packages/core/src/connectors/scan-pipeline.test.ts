import { describe, expect, it } from 'vitest';
import { ConnectorPipeline } from './scan-pipeline';
import type { SourceConnector } from './source';
import { MemoryStorage } from '../persistence/storage';
import type { IndexedItem } from '../indexing/indexer';

describe('ConnectorPipeline', () => {
  it('runs source records through validation, persistence, and indexing', async () => {
    const storage = new MemoryStorage<IndexedItem>();
    const pipeline = new ConnectorPipeline(storage);
    const connector: SourceConnector = {
      id: 'device-1', kind: 'filesystem', displayName: 'Test',
      async *scan() {
        yield {
          id: 'device-1:post.json', sourceId: 'device-1', path: '/posts/post.json',
          name: 'post.json', type: 'json', size: 100,
          modifiedAt: '2026-07-15T00:00:00.000Z', contentHash: 'abc123',
          metadata: { platform: 'instagram', topic: 'legacy' },
        };
      },
      async health() { return { ok: true }; },
    };

    const result = await pipeline.scan(connector);

    expect(result).toEqual({ discovered: 1, ingested: 1, errors: [] });
    const stored = storage.get('device-1:post.json');
    expect(stored?.metadata.contentHash).toBe('abc123');
    expect(stored?.metadata.path).toBe('/posts/post.json');
  });

  it('isolates invalid source records from the rest of a scan', async () => {
    const pipeline = new ConnectorPipeline(new MemoryStorage<IndexedItem>());
    const connector: SourceConnector = {
      id: 'device-2', kind: 'filesystem', displayName: 'Test',
      async *scan() {
        yield { id: '', sourceId: 'device-2', path: '/bad', name: 'bad', type: 'file' };
        yield { id: 'good', sourceId: 'device-2', path: '/good', name: 'good', type: 'file' };
      },
      async health() { return { ok: true }; },
    };

    const result = await pipeline.scan(connector);
    expect(result.discovered).toBe(2);
    expect(result.ingested).toBe(1);
    expect(result.errors).toHaveLength(1);
  });
});
