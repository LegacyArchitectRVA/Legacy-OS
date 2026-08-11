import type { MemoryEvidenceKind } from "./model.js";
import type { IngestionInput } from "./ingestion.js";

export interface SourceAdapter<TInput = unknown> {
  readonly kind: MemoryEvidenceKind;
  normalize(input: TInput): IngestionInput;
}

export interface TextSourceInput {
  id: string;
  title: string;
  text: string;
  importedAt: string;
  capturedAt?: string;
  ownerPersonId?: string;
  uri?: string;
  contentHash?: string;
}

export function createTextAdapter(
  kind: Extract<MemoryEvidenceKind, "note" | "message" | "email" | "social">,
): SourceAdapter<TextSourceInput> {
  return {
    kind,
    normalize(input) {
      return {
        sourceId: input.id,
        kind,
        title: input.title,
        importedAt: input.importedAt,
        capturedAt: input.capturedAt,
        ownerPersonId: input.ownerPersonId,
        uri: input.uri,
        contentHash: input.contentHash,
        text: input.text,
      };
    },
  };
}

export interface MediaSourceInput {
  id: string;
  title: string;
  uri: string;
  importedAt: string;
  capturedAt?: string;
  ownerPersonId?: string;
  contentHash?: string;
}

export function createMediaAdapter(
  kind: Extract<MemoryEvidenceKind, "photo" | "video" | "audio">,
): SourceAdapter<MediaSourceInput> {
  return {
    kind,
    normalize(input) {
      return {
        sourceId: input.id,
        kind,
        title: input.title,
        importedAt: input.importedAt,
        capturedAt: input.capturedAt,
        ownerPersonId: input.ownerPersonId,
        uri: input.uri,
        contentHash: input.contentHash,
      };
    },
  };
}
