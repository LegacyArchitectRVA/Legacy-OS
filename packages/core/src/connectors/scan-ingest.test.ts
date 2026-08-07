import { describe, expect, it } from 'vitest';
import { IngestionPipeline } from '../ingestion/pipeline';
import { MemoryStorage } from '../persistence/storage';
import type { SourceConnector } from './source';
import { ConnectorScanIngestor } from './scan-ingest';

describe('ConnectorScanIngestor', () => {
  it('streams discovered source items into ingestion', async () => {
    const storage = new MemoryStorage();
    const pipeline = new IngestionPipeline(storage);
    const ingestor = new ConnectorScanIngestor(pipeline);
    const connector: SourceConnector = {
      id: 'test-source',
      kind: 'filesystem',
      displayName: 'Test source',
      async *scan() {
        yield {
          id: 'test-source:file.txt',
          sourceId: 'test-source',
          path: '/tmp/file.txt',
          name: 'file.txt',
          type: 'txt',
          size: 10,
          modifiedAt: '2026-07-01T00:00:00.000Z',
          contentHash: 'abc',
        };
      },
      async health() { return { ok: true }; },
    };

    const result = await ingestor.run(connector);

    expect(result).toEqual({ discovered: 1, ingested: 1, errors: [] });
    expect(storage.get('test-source:file.txt')?.value.metadata).toMatchObject({
      path: '/tmp/file.txt',
      contentHash: 'abc',
    });
  });
});
