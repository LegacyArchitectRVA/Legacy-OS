import { evidenceClasses, type EvidenceClass, type RecallMemoryInput } from "./recall";

export interface RecallIntelligence {
  evidenceClass: EvidenceClass;
  confidence: number | undefined;
  needsVerification: boolean;
  explanation: string;
}

export function assessRecallIntelligence(input: Pick<RecallMemoryInput, "evidenceClass" | "confidence" | "sourceRefs" | "narrative">): RecallIntelligence {
  const sourceCount = input.sourceRefs?.filter((value) => value.trim()).length ?? 0;
  const narrativeLength = input.narrative.trim().length;
  const evidenceClass = evidenceClasses.includes(input.evidenceClass) ? input.evidenceClass : "unknown";
  const confidence = input.confidence === undefined ? undefined : Math.min(1, Math.max(0, input.confidence));

  if (evidenceClass === "unknown") {
    return { evidenceClass, confidence, needsVerification: true, explanation: "The memory is explicitly unverified and should not be treated as established fact." };
  }

  if (evidenceClass === "inferred") {
    return { evidenceClass, confidence, needsVerification: true, explanation: "The memory is an inference and should be confirmed before being presented as fact." };
  }

  if (evidenceClass === "reconstructed") {
    return { evidenceClass, confidence, needsVerification: sourceCount === 0 || narrativeLength < 20, explanation: sourceCount === 0 ? "The reconstruction has no source references yet." : "The memory was reconstructed from available context and should retain its supporting sources." };
  }

  return { evidenceClass: "known", confidence: confidence ?? 1, needsVerification: sourceCount === 0, explanation: sourceCount === 0 ? "The memory is marked known but has no source reference attached." : "The memory is marked known and has supporting source references." };
}
