import type { MemoryEvidenceKind, MemoryGraph, MemorySource } from "./model.js";

export interface IngestionInput {
  sourceId: string;
  kind: MemoryEvidenceKind;
  title: string;
  importedAt: string;
  capturedAt?: string;
  uri?: string;
  contentHash?: string;
  ownerPersonId?: string;
  text?: string;
}

export interface IngestionRecord {
  source: MemorySource;
  provenance: {
    sourceId: string;
    importedAt: string;
    capturedAt?: string;
    contentHash?: string;
    extractionVersion: string;
  };
}

export const EXTRACTION_VERSION = "echo-ingestion-v1";

/** Adds a source without inventing a memory from incomplete material. */
export function ingestSource(
  graph: MemoryGraph,
  input: IngestionInput,
): { graph: MemoryGraph; record: IngestionRecord } {
  const source: MemorySource = {
    id: input.sourceId,
    kind: input.kind,
    title: input.title,
    importedAt: input.importedAt,
    capturedAt: input.capturedAt,
    uri: input.uri,
    contentHash: input.contentHash,
    ownerPersonId: input.ownerPersonId,
  };

  if (graph.sources.some((existing) => existing.id === source.id)) {
    throw new Error(`Duplicate source id: ${source.id}`);
  }

  const nextGraph: MemoryGraph = {
    ...graph,
    sources: [...graph.sources, source],
  };

  return {
    graph: nextGraph,
    record: {
      source,
      provenance: {
        sourceId: source.id,
        importedAt: source.importedAt,
        capturedAt: source.capturedAt,
        contentHash: source.contentHash,
        extractionVersion: EXTRACTION_VERSION,
      },
    },
  };
}
