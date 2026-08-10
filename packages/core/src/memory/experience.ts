import type { Memory, MemoryMatch, MemoryResponse, MemorySource } from "./model.js";

export type EchoActionKind =
  | "speak"
  | "gesture"
  | "expression"
  | "scene"
  | "show-media"
  | "show-evidence";

export interface EchoAvatarProfile {
  displayName: string;
  voiceProfileId?: string;
  avatarProfileId?: string;
  animationProfileId?: string;
  identityDisclosure: "ai-representation";
}

export interface EchoMediaCue {
  sourceId: string;
  kind: MemorySource["kind"];
  title: string;
  uri?: string;
  timing: "before" | "during" | "after";
  spatial: {
    anchor: "left" | "right" | "front" | "background";
    emphasis: "primary" | "secondary";
  };
}

export interface EchoSceneState {
  location?: string;
  environment: "documented" | "reconstructed";
  reconstructionNote?: string;
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
  avatar: EchoAvatarProfile;
  scene: EchoSceneState;
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
  const mediaCues: EchoMediaCue[] = match.matchedEvidence.map((evidence, index) => ({
    sourceId: evidence.sourceId,
    kind: evidence.kind,
    title: evidence.excerpt ?? evidence.id,
    timing: evidence.kind === "photo" || evidence.kind === "video" ? "during" : "after",
    spatial: {
      anchor: index % 2 === 0 ? "left" : "right",
      emphasis: index === 0 ? "primary" : "secondary",
    },
  }));

  const scene: EchoSceneState = memory.location
    ? {
        location: memory.location,
        environment: "reconstructed",
        reconstructionNote:
          "Environmental details not directly supported by evidence must remain clearly identified as reconstruction.",
      }
    : { environment: "reconstructed" };

  const actions: EchoAction[] = [
    {
      kind: "speak",
      instruction: `Deliver only the grounded narrative in the subject's authorized Echo voice: ${memory.summary}`,
      grounded: true,
    },
    {
      kind: "expression",
      instruction:
        "Use natural facial expression and conversational timing. Do not invent a specific historical expression or gesture unless supported by source media.",
      grounded: false,
    },
    {
      kind: "show-evidence",
      instruction: "Keep cited evidence visible and attributable throughout the experience.",
      grounded: true,
    },
  ];

  if (mediaCues.length > 0) {
    actions.push({
      kind: "show-media",
      instruction: "Present original photographs, video, audio, notes, messages, or other cited media alongside the reconstructed experience.",
      grounded: true,
    });
  }

  if (memory.location) {
    actions.push({
      kind: "scene",
      instruction: `Reconstruct a visual setting consistent with the documented location: ${memory.location}.`,
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
    avatar: {
      displayName: memory.subjectPersonId,
      identityDisclosure: "ai-representation",
    },
    scene,
    actions,
    mediaCues,
    evidenceIds: match.matchedEvidence.map((evidence) => evidence.id),
    disclosure: response.disclosure,
  };
}
