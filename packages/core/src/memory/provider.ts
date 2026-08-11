import type { ExtractionResult } from "./extraction.js";
import type { IngestionRecord } from "./ingestion.js";

export interface ExtractionProvider {
  readonly id: string;
  readonly version: string;
  readonly supports: readonly string[];
  extract(record: IngestionRecord): Promise<ExtractionResult>;
}

export async function extractWithProvider(
  provider: ExtractionProvider,
  record: IngestionRecord,
): Promise<ExtractionResult> {
  if (!provider.supports.includes(record.source.kind)) {
    throw new Error(`Provider ${provider.id} does not support ${record.source.kind}`);
  }

  return provider.extract(record);
}
