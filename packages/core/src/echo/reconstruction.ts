export type ReconstructionKind = "voice" | "avatar" | "scene" | "memory-playback";

export interface ReconstructionSource {
  sourceId: string;
  kind: "photo" | "video" | "audio" | "note" | "message" | "email" | "social" | "document" | "family-submission";
  confidence: number;
}

export interface ReconstructionSegment {
  id: string;
  kind: ReconstructionKind;
  subjectPersonId: string;
  knowledgeState: "known" | "reconstructed" | "inferred";
  confidence: number;
  sourceIds: string[];
  consentScope: "voice" | "avatar" | "reconstruction";
  generated: boolean;
}

export interface EchoExperiencePlan {
  subjectPersonId: string;
  viewerPersonId: string;
  memoryId: string;
  segments: ReconstructionSegment[];
}

/**
 * A renderer consumes this contract. The core never pretends generated motion,
 * speech, or scenery is original evidence.
 */
export function createReconstructionSegment(input: Omit<ReconstructionSegment, "generated">): ReconstructionSegment {
  return { ...input, generated: true };
}

export function createExperiencePlan(
  subjectPersonId: string,
  viewerPersonId: string,
  memoryId: string,
  sourceIds: string[],
): EchoExperiencePlan {
  return {
    subjectPersonId,
    viewerPersonId,
    memoryId,
    segments: [
      createReconstructionSegment({
        id: `${memoryId}:scene`,
        kind: "scene",
        subjectPersonId,
        knowledgeState: "reconstructed",
        confidence: 0,
        sourceIds,
        consentScope: "reconstruction",
      }),
    ],
  };
}
