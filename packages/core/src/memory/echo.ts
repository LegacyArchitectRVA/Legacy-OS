import type { MemoryGraph, MemoryQueryContext, MemoryResponse } from "./model.js";
import { buildMemoryResponse } from "./graph.js";

export interface EchoPersona {
  displayName: string;
  relationshipLabel?: string;
  voiceProfileId?: string;
  avatarProfileId?: string;
}

export interface EchoRequest extends MemoryQueryContext {
  persona: EchoPersona;
}

export interface EchoResponse extends MemoryResponse {
  persona: EchoPersona;
  experience: {
    mode: "grounded-memory" | "insufficient-evidence";
    memoryId?: string;
    mediaSourceIds: string[];
  };
}

/**
 * First conversational boundary for Echo. It deliberately returns evidence
 * and provenance alongside the response so a future voice/3D renderer cannot
 * treat generated content as historical fact.
 */
export function createEchoResponse(graph: MemoryGraph, request: EchoRequest): EchoResponse {
  const response = buildMemoryResponse(graph, request);
  const strongest = response.matches[0];

  return {
    ...response,
    persona: request.persona,
    experience: strongest
      ? {
          mode: "grounded-memory",
          memoryId: strongest.memory.id,
          mediaSourceIds: strongest.matchedEvidence.map((evidence) => evidence.sourceId),
        }
      : {
          mode: "insufficient-evidence",
          mediaSourceIds: [],
        },
  };
}
