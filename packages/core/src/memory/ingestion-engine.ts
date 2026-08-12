import type { MemoryEvidenceKind } from "./model.js";

export interface RawSource {
  id: string;
  filename: string;
  mimeType: string;
  importedAt: string;
  capturedAt?: string;
  uri?: string;
  contentHash?: string;
  text?: string;
}

export interface ExtractedFact {
  id: string;
  sourceId: string;
  kind: MemoryEvidenceKind;
  field: string;
  value: string;
  confidence: number;
  extractedAt: string;
}

export interface ExtractionProvider {
  supports(source: RawSource): boolean;
  extract(source: RawSource): ExtractedFact[];
}

export interface IngestionResult {
  source: RawSource;
  facts: ExtractedFact[];
  warnings: string[];
}

function classify(source: RawSource): MemoryEvidenceKind {
  if (source.mimeType === "application/pdf") return "document";
  if (source.mimeType.startsWith("image/")) return "photo";
  if (source.mimeType.startsWith("video/")) return "video";
  if (source.mimeType.startsWith("audio/")) return "audio";
  if (source.mimeType.includes("message")) return "message";
  if (source.mimeType.includes("email")) return "email";
  return "document";
}

export const textExtractionProvider: ExtractionProvider = {
  supports(source) {
    return typeof source.text === "string";
  },
  extract(source) {
    if (!source.text?.trim()) return [];
    return [{
      id: `fact:${source.id}:text`,
      sourceId: source.id,
      kind: classify(source),
      field: "text",
      value: source.text,
      confidence: 1,
      extractedAt: source.importedAt,
    }];
  },
};

export function ingestSource(
  source: RawSource,
  providers: readonly ExtractionProvider[] = [textExtractionProvider],
): IngestionResult {
  const provider = providers.find((candidate) => candidate.supports(source));
  if (!provider) {
    return {
      source,
      facts: [],
      warnings: [`No extraction provider is registered for ${source.mimeType}.`],
    };
  }

  return {
    source,
    facts: provider.extract(source),
    warnings: [],
  };
}
