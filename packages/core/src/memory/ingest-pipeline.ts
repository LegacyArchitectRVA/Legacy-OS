import { ingestSource, type IngestionInput, type IngestionRecord } from "./ingestion.js";
import { extractWithProvider, type ExtractionProvider } from "./provider.js";
import { commitCandidateMemory, type ExtractionResult } from "./extraction.js";
import type { MemoryGraph } from "./model.js";

export interface IngestPipelineResult {
  graph: MemoryGraph;
  record: IngestionRecord;
  extraction: ExtractionResult;
}

/**
 * The safe ingestion path: source registration happens before extraction,
 * and extraction must explicitly return a candidate before a memory is created.
 */
export async function runIngestPipeline(
  graph: MemoryGraph,
  input: IngestionInput,
  provider: ExtractionProvider,
): Promise<IngestPipelineResult> {
  const registered = ingestSource(graph, input);
  const extraction = await extractWithProvider(provider, registered.record);
  const nextGraph = commitCandidateMemory(registered.graph, registered.record, extraction);

  return {
    graph: nextGraph,
    record: registered.record,
    extraction,
  };
}
