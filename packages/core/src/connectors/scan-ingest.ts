import type { IngestionPipeline, IngestionRecord } from '../ingestion/pipeline';
import type { SourceConnector, SourceItem, SourceScanOptions } from './source';

export type ScanResult = {
  discovered: number;
  ingested: number;
  errors: Array<{ itemId: string; message: string }>;
};

export class ConnectorScanIngestor {
  constructor(private readonly pipeline: IngestionPipeline) {}

  async run(connector: SourceConnector, options?: SourceScanOptions): Promise<ScanResult> {
    let discovered = 0;
    let ingested = 0;
    const errors: ScanResult['errors'] = [];

    for await (const item of connector.scan(options)) {
      discovered += 1;
      try {
        this.pipeline.ingest(this.toIngestionRecord(item));
        ingested += 1;
      } catch (error) {
        errors.push({
          itemId: item.id,
          message: error instanceof Error ? error.message : 'Unknown ingestion error',
        });
      }
    }

    return { discovered, ingested, errors };
  }

  private toIngestionRecord(item: SourceItem): IngestionRecord {
    return {
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
      createdAt: item.modifiedAt,
      updatedAt: item.modifiedAt,
    };
  }
}
