import type { MemoryVisibility } from "./model.js";

export type SupportedLanguage =
  | "en-US"
  | "es"
  | "fr"
  | "de"
  | "it"
  | "pt"
  | "ja"
  | "ko"
  | "zh"
  | "ar"
  | "ru";

export interface OriginalMediaReference {
  sourceId: string;
  mediaId: string;
  language: SupportedLanguage | "unknown";
  mimeType: string;
}

export interface ConversationLanguageRequest {
  inputLanguage?: SupportedLanguage;
  requestedLanguage?: SupportedLanguage;
  visibility: MemoryVisibility;
  originalMedia?: OriginalMediaReference;
}

export interface PlaybackPlan {
  responseLanguage: SupportedLanguage;
  originalMedia?: OriginalMediaReference;
  playOriginal: boolean;
  generatedSpeechLanguage: SupportedLanguage;
}

export function chooseResponseLanguage(
  request: Pick<ConversationLanguageRequest, "inputLanguage" | "requestedLanguage">,
): SupportedLanguage {
  return request.requestedLanguage ?? request.inputLanguage ?? "en-US";
}

export function buildPlaybackPlan(request: ConversationLanguageRequest): PlaybackPlan {
  const responseLanguage = chooseResponseLanguage(request);
  return {
    responseLanguage,
    generatedSpeechLanguage: responseLanguage,
    originalMedia: request.originalMedia,
    playOriginal: Boolean(request.originalMedia),
  };
}
