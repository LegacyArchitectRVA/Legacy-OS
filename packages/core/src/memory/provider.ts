import type { ExtractionAdapter, ExtractionResult } from "./extraction.js";
import type { IngestionRecord } from "./ingestion.js";

export interface ExtractionProvider {
  id: string;
  version: string;
  supports: readonly string[];
  extract(record: IngestionRecord): Promise<ExtractionResult>;
}

/** Wraps any future model/provider behind the deterministic core contract. */
export function createProviderAdapter(provider: ExtractionProvider): ExtractionAdapter {
  return {
    extract(record) {
      throw new Error(
        `Provider ${provider.id} is asynchronous; use extractWithProvider instead.`,
      );
    },
  };
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
