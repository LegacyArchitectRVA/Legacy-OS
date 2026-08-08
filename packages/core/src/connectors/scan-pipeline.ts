import { LegacyIndexer, type IndexedItem } from '../indexing/indexer';
import { MemoryStorage, type StorageAdapter } from '../persistence/storage';
import { IntegrationPipeline, type PipelineContext, type PipelineStep } from '../pipeline/integration-pipeline';
import { StorageIndexStep } from '../pipeline/storage-index-step';
import type { SourceConnector, SourceScanOptions } from './source';

export class RecordValidationStep implements PipelineStep {
  readonly name = 'validate-records';

  async execute(context: PipelineContext): Promise<PipelineContext> {
    for (const record of context.records) {
      if (!isRecord(record)) throw new Error('Pipeline record must be an object');
      for (const field of ['id', 'sourceId', 'name', 'type']) {
        if (typeof record[field] !== 'string' || record[field].length === 0) {
          throw new Error(`Invalid record field: ${field}`);
        }
      }
    }
    return { ...context, validated: true };
  }
}

export class ConnectorPipeline {
  private readonly pipeline: IntegrationPipeline;

  constructor(
    private readonly storage: StorageAdapter<IndexedItem> = new MemoryStorage<IndexedItem>(),
    private readonly indexer = new LegacyIndexer(),
  ) {
    this.pipeline = new IntegrationPipeline([
      new RecordValidationStep(),
      new StorageIndexStep(this.storage, this.indexer),
    ]);
  }

  async scan(connector: SourceConnector, options?: SourceScanOptions) {
    let discovered = 0;
    let ingested = 0;
    const errors: Array<{ itemId: string; message: string }> = [];

    for await (const item of connector.scan(options)) {
      discovered += 1;
      try {
        const now = new Date().toISOString();
        const context: PipelineContext = {
          sourceId: item.sourceId,
          records: [{
            id: item.id,
            sourceId: item.sourceId,
            name: item.name,
            type: item.type,
            metadata: {
              ...item.metadata,
              path: item.path,
              size: item.size,
              modifiedAt: item.modifiedAt,
              contentHash: item.contentHash,
            },
            createdAt: item.modifiedAt ?? now,
            updatedAt: item.modifiedAt ?? now,
          }],
          validated: false,
          indexed: false,
          persisted: false,
        };

        await this.pipeline.run(context);
        ingested += 1;
      } catch (error) {
        errors.push({
          itemId: item.id,
          message: error instanceof Error ? error.message : 'Unknown pipeline error',
        });
      }
    }

    return { discovered, ingested, errors };
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
