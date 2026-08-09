import type { Memory, MemoryMatch, MemoryResponse, MemorySource } from "./model.js";

export type EchoActionKind =
  | "speak"
  | "gesture"
  | "expression"
  | "scene"
  | "show-media"
  | "show-evidence";

export interface EchoMediaCue {
  sourceId: string;
  kind: MemorySource["kind"];
  title: string;
  uri?: string;
  timing: "before" | "during" | "after";
}

export interface EchoAction {
  kind: EchoActionKind;
  instruction: string;
  grounded: boolean;
}

export interface MemoryExperience {
  id: string;
  memoryId: string;
  subjectPersonId: string;
  viewerPersonId: string;
  title: string;
  narrative: string;
  knowledgeState: Memory["knowledgeState"];
  confidence: number;
  actions: EchoAction[];
  mediaCues: EchoMediaCue[];
  evidenceIds: string[];
  disclosure: MemoryResponse["disclosure"];
}

export function buildMemoryExperience(
  response: MemoryResponse,
  viewerPersonId: string,
): MemoryExperience | null {
  const match: MemoryMatch | undefined = response.matches[0];
  if (!match) return null;

  const memory = match.memory;
  const mediaCues: EchoMediaCue[] = match.matchedEvidence.map((evidence) => {
    const source = response.matches[0]?.memory.evidence.find((item) => item.id === evidence.id);
    return {
      sourceId: evidence.sourceId,
      kind: evidence.kind,
      title: source?.id ?? evidence.id,
      timing: evidence.kind === "photo" || evidence.kind === "video" ? "during" : "after",
    };
  });

  const actions: EchoAction[] = [
    {
      kind: "speak",
      instruction: `Deliver the grounded narrative naturally in the subject's authorized Echo voice: ${memory.summary}`,
      grounded: true,
    },
    {
      kind: "expression",
      instruction: "Use subtle, natural facial expression and conversational timing; do not invent a specific historical gesture unless supported by source media.",
      grounded: false,
    },
    {
      kind: "show-evidence",
      instruction: "Keep the cited evidence available alongside the reconstructed experience.",
      grounded: true,
    },
  ];

  if (memory.location) {
    actions.push({
      kind: "scene",
      instruction: `Reconstruct a visual setting consistent with the documented location: ${memory.location}. Clearly treat environmental details not supported by evidence as reconstruction.`,
      grounded: true,
    });
  }

  return {
    id: `experience:${memory.id}:${viewerPersonId}`,
    memoryId: memory.id,
    subjectPersonId: memory.subjectPersonId,
    viewerPersonId,
    title: memory.title,
    narrative: response.answer,
    knowledgeState: memory.knowledgeState,
    confidence: memory.confidence,
    actions,
    mediaCues,
    evidenceIds: match.matchedEvidence.map((evidence) => evidence.id),
    disclosure: response.disclosure,
  };
}
