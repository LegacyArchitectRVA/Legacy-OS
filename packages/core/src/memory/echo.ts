import type { MemoryGraph, MemoryQueryContext, MemoryResponse } from "./model.js";
import { buildMemoryResponse } from "./graph.js";
import { authorizeEchoAccess, canAccessMemory } from "./access.js";

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
    mode: "grounded-memory" | "insufficient-evidence" | "access-denied";
    memoryId?: string;
    mediaSourceIds: string[];
  };
}

/**
 * Conversational boundary for Echo. Authorization happens before historical
 * content is exposed to the experience layer.
 */
export function createEchoResponse(graph: MemoryGraph, request: EchoRequest): EchoResponse {
  const authorization = authorizeEchoAccess(graph, request);
  const response = buildMemoryResponse(graph, request);
  const strongest = response.matches[0];

  if (!authorization.relationshipVerified) {
    return {
      answer: "I can't share this person's memories until your relationship to them is verified.",
      matches: [],
      disclosure: { knowledgeState: "unknown", confidence: 0, evidenceCount: 0 },
      persona: request.persona,
      experience: { mode: "access-denied", mediaSourceIds: [] },
    };
  }

  if (!strongest || !canAccessMemory(strongest.memory, authorization).allowed) {
    return {
      ...response,
      persona: request.persona,
      experience: { mode: "insufficient-evidence", mediaSourceIds: [] },
    };
  }

  return {
    ...response,
    persona: request.persona,
    experience: {
      mode: "grounded-memory",
      memoryId: strongest.memory.id,
      mediaSourceIds: strongest.matchedEvidence.map((evidence) => evidence.sourceId),
    },
  };
}
