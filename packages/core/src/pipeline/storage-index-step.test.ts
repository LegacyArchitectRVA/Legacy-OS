import { describe, expect, it } from 'vitest';
import { LegacyIndexer } from '../indexing/indexer';
import { MemoryStorage } from '../persistence/storage';
import type { PipelineContext } from './integration-pipeline';
import { StorageIndexStep } from './storage-index-step';

describe('StorageIndexStep', () => {
  it('persists and indexes validated records', async () => {
    const storage = new MemoryStorage();
    const indexer = new LegacyIndexer();
    const step = new StorageIndexStep(storage, indexer);
    const record = {
      id: 'social-1',
      sourceId: 'device-1',
      name: 'July post',
      type: 'social-post',
      metadata: { platform: 'Instagram', path: '/social/july/post.json' },
      createdAt: '2026-07-10T12:00:00.000Z',
      updatedAt: '2026-07-10T12:00:00.000Z',
    };
    const context: PipelineContext = {
      sourceId: 'device-1',
      records: [record],
      validated: true,
      indexed: false,
      persisted: false,
    };

    const result = await step.execute(context);

    expect(result.persisted).toBe(true);
    expect(result.indexed).toBe(true);
    expect(storage.get('social-1')?.value).toEqual(record);
    expect(storage.history('social-1')).toHaveLength(1);
    expect(indexer.search({ text: 'July post' })).toHaveLength(1);
  });

  it('rejects unvalidated records', async () => {
    const step = new StorageIndexStep(new MemoryStorage(), new LegacyIndexer());
    const context: PipelineContext = {
      sourceId: 'device-1',
      records: [],
      validated: false,
      indexed: false,
      persisted: false,
    };

    await expect(step.execute(context)).rejects.toThrow(
      'Pipeline context must be validated before persistence',
    );
  });
});
