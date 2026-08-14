export type SupportedLanguage = string;

export interface DetectedLanguage {
  language: SupportedLanguage;
  confidence: number;
  source: "explicit" | "script" | "default";
}

export interface LanguagePolicy {
  defaultLanguage: "en-US";
  requestedLanguage?: SupportedLanguage;
}

export interface OriginalMedia {
  sourceId: string;
  language?: SupportedLanguage;
  mediaUri: string;
}

export interface PlaybackPlan {
  responseLanguage: SupportedLanguage;
  playOriginal: boolean;
  original?: OriginalMedia;
}

export function detectLanguage(text: string): DetectedLanguage {
  if (!text.trim()) return { language: "en-US", confidence: 1, source: "default" };
  if (/[\u3040-\u30ff]/.test(text)) return { language: "ja", confidence: 0.98, source: "script" };
  if (/[\uac00-\ud7af]/.test(text)) return { language: "ko", confidence: 0.98, source: "script" };
  if (/[\u4e00-\u9fff]/.test(text)) return { language: "zh", confidence: 0.95, source: "script" };
  if (/[\u0600-\u06ff]/.test(text)) return { language: "ar", confidence: 0.98, source: "script" };
  if (/[\u0400-\u04ff]/.test(text)) return { language: "ru", confidence: 0.98, source: "script" };
  return { language: "en-US", confidence: 0.5, source: "default" };
}

export function chooseResponseLanguage(
  policy: LanguagePolicy,
  detected: DetectedLanguage,
): SupportedLanguage {
  return policy.requestedLanguage ?? detected.language ?? policy.defaultLanguage;
}

export function createPlaybackPlan(
  policy: LanguagePolicy,
  detected: DetectedLanguage,
  original?: OriginalMedia,
): PlaybackPlan {
  return {
    responseLanguage: chooseResponseLanguage(policy, detected),
    playOriginal: Boolean(original),
    original,
  };
}
