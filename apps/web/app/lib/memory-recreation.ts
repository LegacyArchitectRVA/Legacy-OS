export type RecreationEvidenceType = "verified" | "inferred" | "reconstructed" | "unknown";

export type RecreationSource = {
  id: string;
  type: "photo" | "video" | "audio" | "document" | "memory" | "conversation";
  title: string;
  uri?: string;
  evidence: RecreationEvidenceType;
};

export type RecreationPerson = {
  id: string;
  displayName: string;
  portraitUri?: string;
  voiceProfileId?: string;
  approvedForRecreation: boolean;
  sources: RecreationSource[];
};

export type RecreationScene = {
  id: string;
  title: string;
  location?: string;
  date?: string;
  sourceIds: string[];
  confidence: number;
};

export type MemoryRecreationRequest = {
  personId: string;
  prompt: string;
  sceneId?: string;
};

export type MemoryRecreationResponse = {
  person: RecreationPerson;
  response: string;
  evidence: RecreationSource[];
  mode: "verified" | "reconstructed";
  disclosure: string;
};

export function buildRecreationResponse(
  person: RecreationPerson,
  prompt: string,
  sources: RecreationSource[],
  scene?: RecreationScene,
): MemoryRecreationResponse {
  const verified = sources.filter((source) => source.evidence === "verified");
  const context = scene ? ` for the scene “${scene.title}”` : "";
  const response = verified[0]
    ? `I can use the preserved record${context} to help answer that. The strongest preserved source is “${verified[0].title}.”`
    : `I don't have enough verified material${context} to present this as something ${person.displayName} actually said. I can still create a clearly labeled reconstruction from the available evidence.`;

  return {
    person,
    response: prompt.trim() ? response : "Ask about a preserved memory, person, place, or event.",
    evidence: sources,
    mode: verified.length > 0 ? "verified" : "reconstructed",
    disclosure: verified.length > 0
      ? "Grounded in preserved source material. The system does not invent the person's literal words."
      : "AI reconstruction. This is an interpretation of preserved evidence, not the person's literal words.",
  };
}
