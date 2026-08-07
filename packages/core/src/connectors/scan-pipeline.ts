import { LegacyIndexer } from '../indexing/indexer';
import { MemoryStorage } from '../persistence/storage';
import { IntegrationPipeline, type PipelineContext, type PipelineStep } from '../pipeline/integration-pipeline';
import { StorageIndexStep } from '../pipeline/storage-index-step';
import type { SourceConnector, SourceScanOptions } from './source';
import { ConnectorScanIngestor } from './scan-ingest';

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
  private readonly ingestor: ConnectorScanIngestor;

  constructor(
    storage = new MemoryStorage(),
    indexer = new LegacyIndexer(),
  ) {
    this.pipeline = new IntegrationPipeline([
      new RecordValidationStep(),
      new StorageIndexStep(storage, indexer),
    ]);
    this.ingestor = new ConnectorScanIngestor({
      ingest: (record) => {
        const context: PipelineContext = {
          sourceId: record.sourceId,
          records: [record],
          validated: false,
          indexed: false,
          persisted: false,
        };
        void this.pipeline.run(context);
        return record as never;
      },
    } as never);
  }

  async scan(connector: SourceConnector, options?: SourceScanOptions) {
    return this.ingestor.run(connector, options);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
