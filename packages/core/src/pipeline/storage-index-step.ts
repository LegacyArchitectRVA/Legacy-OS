import type { IndexedItem, LegacyIndexer } from '../indexing/indexer';
import type { StorageAdapter } from '../persistence/storage';
import type { PipelineContext, PipelineStep } from './integration-pipeline';

export class StorageIndexStep implements PipelineStep {
  readonly name = 'storage-index';

  constructor(
    private readonly storage: StorageAdapter<IndexedItem>,
    private readonly indexer: LegacyIndexer,
  ) {}

  async execute(context: PipelineContext): Promise<PipelineContext> {
    if (!context.validated) {
      throw new Error('Pipeline context must be validated before persistence');
    }

    for (const record of context.records) {
      const item = record as IndexedItem;
      const stored = this.storage.save({
        id: item.id,
        value: item,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        sourceId: item.sourceId,
        sourcePath: typeof item.metadata.path === 'string' ? item.metadata.path : undefined,
        contentHash: typeof item.metadata.contentHash === 'string' ? item.metadata.contentHash : undefined,
      });
      this.indexer.add(stored.value);
    }

    return {
      ...context,
      indexed: true,
      persisted: true,
    };
  }
}
