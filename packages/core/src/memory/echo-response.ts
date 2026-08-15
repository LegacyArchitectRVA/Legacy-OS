import type { MemoryVisibility } from "./model.js";
import {
  buildPlaybackPlan,
  type ConversationLanguageRequest,
  type OriginalMediaReference,
  type SupportedLanguage,
} from "./language-playback.js";

export interface EvidenceLanguage {
  evidenceId: string;
  language: SupportedLanguage | "unknown";
  originalMedia?: OriginalMediaReference;
}

export interface EchoResponse {
  answer: string;
  responseLanguage: SupportedLanguage;
  evidenceLanguages: EvidenceLanguage[];
  originalMedia: OriginalMediaReference[];
  playback: ReturnType<typeof buildPlaybackPlan>;
  visibility: MemoryVisibility;
}

export interface EchoResponseInput {
  answer: string;
  language: Pick<ConversationLanguageRequest, "inputLanguage" | "requestedLanguage">;
  visibility: MemoryVisibility;
  evidenceLanguages?: EvidenceLanguage[];
}

export function buildEchoResponse(input: EchoResponseInput): EchoResponse {
  const evidenceLanguages = input.evidenceLanguages ?? [];
  const originalMedia = evidenceLanguages
    .map((evidence) => evidence.originalMedia)
    .filter((media): media is OriginalMediaReference => Boolean(media));

  const playback = buildPlaybackPlan({
    ...input.language,
    visibility: input.visibility,
    originalMedia: originalMedia[0],
  });

  return {
    answer: input.answer,
    responseLanguage: playback.responseLanguage,
    evidenceLanguages,
    originalMedia,
    playback,
    visibility: input.visibility,
  };
}
